import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Navigation,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AIAnalysisResult, EnvironmentalReport, ReportCategory, ReportSeverity } from '../types';
import LeafletMap from '../components/LeafletMap';
import { compressImage, processAndUploadReportImage } from '../services/imageService';
import { createReport } from '../services/reportService';
import { analyzeIncidentImage } from '../services/aiService';

interface ReportFormViewProps {
  category: ReportCategory;
  reporterName: string;
  onBack: () => void;
  onSubmitSuccess: (report: EnvironmentalReport) => void;
}

export default function ReportFormView({
  category,
  reporterName,
  onBack,
  onSubmitSuccess,
}: ReportFormViewProps) {
  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');

  // Media State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [optimizedSizeKb, setOptimizedSizeKb] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Location detection state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // File Upload Handler with zero-cost client compression
  const handleFileChange = async (file: File) => {
    setFormError(null);
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Only JPG, JPEG, PNG, and WEBP formats are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size must be 10MB or smaller.');
      return;
    }

    setImageFile(file);
    setIsCompressing(true);

    try {
      // Free client-side downsampling & compression
      const { dataUrl, sizeKb } = await compressImage(file, 1000, 0.78);
      setImageBase64(dataUrl);
      setOptimizedSizeKb(sizeKb);
      setAiAnalysis(null);
      setAiError(null);
    } catch {
      // Fallback to standard reader
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setAiAnalysis(null);
        setAiError(null);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // AI Image Analysis with Gemini Free Tier
  const handleAnalyzeWithAI = async () => {
    if (!imageBase64) {
      setFormError('Please upload an evidence image first before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeIncidentImage({
        imageBase64,
        category,
        description: description || 'Visual observation of reported environmental incident',
      });
      setAiAnalysis(result);
    } catch {
      setAiError('AI analysis could not complete. You can still proceed with submission.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);

        if (!locationText) {
          setLocationText(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. You can enter location details manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please enter details manually.');
            break;
          case error.TIMEOUT:
            setLocationError('Location detection timed out. Please enter details manually.');
            break;
          default:
            setLocationError('Unable to detect location. Please enter manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submit Report with ₹0 Image Storage & Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    setFormError(null);

    // Validation
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(\+91[6-9]\d{9}|0?[6-9]\d{9})$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian phone number (or +91 format).');
      return;
    }

    if (!description || description.trim().length < 5) {
      setFormError('Please describe the observed incident (at least 5 characters).');
      return;
    }

    if (!imageBase64) {
      setFormError('Please upload an evidence photograph of the issue.');
      return;
    }

    if (!locationText.trim() && latitude === null) {
      setFormError('Please provide location coordinates or enter a landmark/address manually.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process image using zero-cost free storage pipeline (direct compressed URI or ImgBB CDN)
      let finalImageUrl = imageBase64;
      if (imageFile) {
        const uploadRes = await processAndUploadReportImage(imageFile);
        finalImageUrl = uploadRes.url;
      }

      const report = await createReport({
        reporterName,
        phoneNumber: cleanPhone,
        category,
        description: description.trim(),
        imageUrl: finalImageUrl,
        latitude,
        longitude,
        locationText: locationText.trim() || `Lat ${latitude?.toFixed(4)}, Lng ${longitude?.toFixed(4)}`,
        isEmergency,
        aiAnalysis,
        aiSuggestedSeverity: aiAnalysis?.severity || (isEmergency ? 'CRITICAL' : 'MEDIUM'),
        severity: isEmergency ? 'CRITICAL' : aiAnalysis?.severity || 'MEDIUM',
      });

      onSubmitSuccess(report);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError('Failed to submit report. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="report-form-container" className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Top Breadcrumb & Title */}
      <button
        id="btn-back-to-categories"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736A] hover:text-[#174A35] mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </button>

      {/* Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#DCE5DE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F7D4A]">
            INCIDENT REPORTING
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
            Report {category}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A] mt-1 font-normal">
            Provide details, photograph evidence, and location coordinates to dispatch environmental responders.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-[#EAF4EC] border border-[#DCE5DE] text-xs font-bold text-[#174A35] shrink-0 self-start sm:self-auto">
          {category}
        </div>
      </div>

      {formError && (
        <div
          id="form-error-banner"
          className="mb-6 p-4 rounded-2xl border border-[#B64242]/30 bg-[#B64242]/5 flex items-start gap-3 text-xs sm:text-sm text-[#B64242]"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#B64242] mt-0.5" />
          <div className="flex-1">
            <span className="block font-bold">Please check your submission:</span>
            <span className="font-medium text-[#17201B]">{formError}</span>
          </div>
        </div>
      )}

      {/* Two Column Layout on Desktop */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT COLUMN: REPORT INFORMATION ================= */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCE5DE] p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#17201B] pb-3 border-b border-[#DCE5DE]">
                Report Information
              </h2>

              {/* Reporter Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-1.5">
                  Reporter Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  readOnly
                  className="w-full px-4 py-3 text-sm bg-[#F7F9F5] border border-[#DCE5DE] rounded-xl text-[#17201B] font-semibold cursor-not-allowed"
                />
                <span className="text-[11px] text-[#65736A] mt-1 block">
                  Citizen session identifier
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="report-phone-input" className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-1.5">
                  Phone Number <span className="text-[#B64242]">*</span>
                </label>
                <input
                  id="report-phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all shadow-2xs font-medium"
                  required
                />
                <span className="text-[11px] text-[#65736A] mt-1 block">
                  Used by authorities for incident verification
                </span>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="report-description-input" className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-1.5">
                  Description <span className="text-[#B64242]">*</span>
                </label>
                <textarea
                  id="report-description-input"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you observed (e.g. Thick black smoke rising from the forest clearing, or chemicals draining into the canal...)"
                  className="w-full px-4 py-3 text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all shadow-2xs leading-relaxed"
                  required
                />
                <span className="text-[11px] text-[#65736A] mt-1 block">
                  Include relevant visual details, scope, or wildlife impacted.
                </span>
              </div>

              {/* Emergency Toggle Card */}
              <div className="p-4 rounded-xl border border-[#DCE5DE] bg-[#F7F9F5] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className={`w-4 h-4 ${isEmergency ? 'text-[#B64242]' : 'text-[#65736A]'}`} />
                    <span className="text-xs font-bold text-[#17201B]">
                      Is this an urgent emergency?
                    </span>
                  </div>
                  <p className="text-[11px] text-[#65736A]">
                    Active flames, severe toxic spills, or trapped animals
                  </p>
                </div>

                <div className="flex items-center gap-1 border border-[#DCE5DE] rounded-xl p-0.5 bg-white shrink-0">
                  <button
                    type="button"
                    id="btn-emergency-no"
                    onClick={() => setIsEmergency(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isEmergency ? 'bg-[#EAF4EC] text-[#174A35]' : 'text-[#65736A] hover:text-[#17201B]'
                    }`}
                  >
                    NO
                  </button>
                  <button
                    type="button"
                    id="btn-emergency-yes"
                    onClick={() => setIsEmergency(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isEmergency ? 'bg-[#B64242] text-white' : 'text-[#65736A] hover:text-[#17201B]'
                    }`}
                  >
                    YES
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PHOTO PREVIEW / LOCATION ================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* PHOTO UPLOAD & PREVIEW CARD */}
            <div className="bg-white rounded-2xl border border-[#DCE5DE] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DE]">
                <h2 className="text-base font-bold text-[#17201B]">
                  Photograph Evidence <span className="text-[#B64242]">*</span>
                </h2>
                <span className="text-[11px] text-[#65736A]">Max 5MB</span>
              </div>

              {!imageBase64 ? (
                <div
                  id="image-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DCE5DE] hover:border-[#2F7D4A] rounded-2xl p-8 text-center bg-[#F7F9F5] hover:bg-[#EAF4EC]/40 transition-colors cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#DCE5DE] text-[#2F7D4A] flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#17201B] mb-1">
                    Upload an Image
                  </h3>
                  <p className="text-xs text-[#65736A]">
                    JPG, PNG or WEBP
                  </p>
                  <input
                    ref={fileInputRef}
                    id="report-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl border border-[#DCE5DE] overflow-hidden bg-[#F7F9F5] max-h-64 flex items-center justify-center">
                    <img
                      src={imageBase64}
                      alt="Upload preview"
                      className="w-full h-full object-contain max-h-64"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageBase64(null);
                        setOptimizedSizeKb(null);
                        setAiAnalysis(null);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-[#17201B]/80 hover:bg-[#B64242] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {optimizedSizeKb && (
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#EAF4EC] border border-[#DCE5DE] text-[#174A35]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" />
                        Zero-cost storage optimized: ~{optimizedSizeKb} KB
                      </span>
                      <span className="text-[11px] text-[#65736A] font-semibold">
                        ₹0 Free Tier Quota
                      </span>
                    </div>
                  )}

                  {/* AI Environmental Analysis Card */}
                  <div className="p-4 sm:p-5 rounded-xl border border-[#DCE5DE] bg-[#EAF4EC] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#2F7D4A]" />
                        <h3 className="text-xs font-bold text-[#174A35] uppercase tracking-wide">
                          AI Environmental Analysis
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#2F7D4A] border border-[#DCE5DE]">
                        AI-generated suggestion
                      </span>
                    </div>

                    {!aiAnalysis && !isAnalyzing && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <p className="text-xs text-[#65736A]">
                          Run computer vision to suggest issue category & severity rating.
                        </p>
                        <button
                          type="button"
                          id="btn-analyze-ai"
                          onClick={handleAnalyzeWithAI}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze Image with AI</span>
                        </button>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-xs text-[#174A35] font-semibold py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing environmental photo with Gemini AI...</span>
                      </div>
                    )}

                    {aiError && (
                      <p className="text-xs text-[#B64242] bg-white p-2.5 rounded-lg border border-[#B64242]/20">
                        {aiError}
                      </p>
                    )}

                    {aiAnalysis && (
                      <div id="ai-analysis-results" className="bg-white p-3.5 rounded-xl border border-[#DCE5DE] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#65736A]">Possible Issue:</span>
                          <span className="font-bold text-[#17201B]">{aiAnalysis.possibleIssue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#65736A]">AI Suggested Severity:</span>
                          <span className="font-bold px-2 py-0.5 rounded bg-[#EAF4EC] text-[#174A35]">
                            {aiAnalysis.severity}
                          </span>
                        </div>
                        {aiAnalysis.observations && aiAnalysis.observations.length > 0 && (
                          <div className="pt-1.5 border-t border-[#DCE5DE]/60">
                            <span className="font-semibold text-[#65736A] block mb-1">Observations:</span>
                            <ul className="list-disc list-inside text-[#17201B] space-y-0.5">
                              {aiAnalysis.observations.map((obs, i) => (
                                <li key={i}>{obs}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-[10px] text-[#65736A] italic pt-1 border-t border-[#DCE5DE]/60">
                          {aiAnalysis.confidenceNotes || 'AI output serves as an assistance feature for review.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LOCATION CARD */}
            <div className="bg-white rounded-2xl border border-[#DCE5DE] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DE]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2F7D4A]" />
                  <h2 className="text-base font-bold text-[#17201B]">Location</h2>
                </div>
                <span className="text-xs text-[#65736A]">Required</span>
              </div>

              <p className="text-xs text-[#65736A]">
                Help us identify where the issue is.
              </p>

              {/* Action buttons: GPS vs Manual */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  id="btn-detect-gps"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#EAF4EC] hover:bg-[#2F7D4A]/15 text-[#174A35] text-xs font-semibold transition-colors cursor-pointer border border-[#DCE5DE]"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMode(locationMode === 'manual' ? 'gps' : 'manual')}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white hover:bg-[#F7F9F5] text-[#17201B] text-xs font-semibold border border-[#DCE5DE] cursor-pointer"
                >
                  <span>Enter Location Manually</span>
                </button>
              </div>

              {locationError && (
                <div className="p-2.5 rounded-lg border border-[#B64242]/20 bg-[#B64242]/5 text-xs text-[#B64242]">
                  {locationError}
                </div>
              )}

              {latitude !== null && longitude !== null && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#174A35] bg-[#EAF4EC] p-3 rounded-xl border border-[#DCE5DE]">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D4A] shrink-0" />
                  <div>
                    <span className="font-bold block">✓ Location detected</span>
                    <span className="text-[11px] text-[#65736A] font-mono">
                      Latitude: {latitude.toFixed(5)}, Longitude: {longitude.toFixed(5)}
                    </span>
                  </div>
                </div>
              )}

              {/* Manual address / landmark field */}
              <div>
                <label htmlFor="report-location-input" className="block text-xs font-semibold text-[#17201B] mb-1">
                  Landmark / Street Address
                </label>
                <input
                  id="report-location-input"
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. Near Lake Shore Culvert, Industrial Area Phase 2"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] focus:border-[#174A35] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Leaflet Map Preview Container */}
              {latitude !== null && longitude !== null && (
                <div className="rounded-xl overflow-hidden border border-[#DCE5DE]">
                  <LeafletMap
                    singleLocation={{
                      latitude,
                      longitude,
                      title: `Reported Location - ${category}`,
                    }}
                    height="180px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= SUBMIT BUTTON ROW ================= */}
        <div className="pt-6 border-t border-[#DCE5DE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#65736A] text-center sm:text-left">
            Your report will be reviewed by verified municipal and environmental officers.
          </p>

          <button
            id="btn-submit-report"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-[#174A35] hover:bg-[#236448] disabled:opacity-50 text-white text-sm font-bold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>◌ Submitting Report...</span>
              </>
            ) : (
              <>
                <span>Submit Environmental Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
