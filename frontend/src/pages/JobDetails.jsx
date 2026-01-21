import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI } from "../services/api";
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaMoneyBillWave,
  FaArrowLeft,
  FaShareAlt,
  FaCopy,
  FaBuilding
} from "react-icons/fa";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const shareableLink = `${window.location.origin}/jobs/${id}`;

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJob(id);
      setJob(response.data);
      setError("");
    } catch (err) {
      setError("Job not found or has been removed");
      console.error("Fetch job error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clipboard copy (React 19 safe + fallback)
  const handleCopyLink = async () => {
    if (copied) return;

    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  /* -------------------- ERROR -------------------- */
  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------- PAGE -------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 mb-4"
          >
            <FaArrowLeft /> Back to Jobs
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{job.title}</h1>

                {job.status === "closed" && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                    Closed
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <FaBuilding /> JobPortal
                </span>
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt /> {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <FaCalendar />
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <FaMoneyBillWave /> {job.salary}
                  </span>
                )}
              </div>
            </div>

            {/* SHARE BUTTON */}
            <div className="relative">
              <button
                onClick={handleCopyLink}
                aria-label="Copy job link"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <FaShareAlt /> Share
              </button>

              {copied && (
                <div className="absolute right-0 mt-2 flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                  <FaCopy /> Copied!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Job Description</h2>

          {job.description ? (
            job.description.split("\n").map((p, i) => (
              <p key={i} className="mb-4 text-gray-700">
                {p}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No description provided.</p>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* SUMMARY */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold mb-4">Job Summary</h3>

            <p className="flex items-center gap-2 mb-2">
              <FaMapMarkerAlt /> {job.location}
            </p>

            {job.salary && (
              <p className="flex items-center gap-2 text-green-600 mb-2">
                <FaMoneyBillWave /> {job.salary}
              </p>
            )}

            <p className="text-sm text-gray-500">Job ID: {id}</p>
          </div>

          {/* SHARE CARD */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Share This Job</h3>
            <button
              onClick={handleCopyLink}
              className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
