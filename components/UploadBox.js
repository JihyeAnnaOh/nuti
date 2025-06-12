'use client';

import { useState, useRef } from 'react';

export default function UploadBox({ onResult }) {
  const [preview, setPreview] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      alert("Camera access was denied or not available.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL('image/png');
      setPreview(imageDataURL);
      stopCamera();
      analyzeWithVision(imageDataURL);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setPreview(imageURL);
    analyzeWithVision(imageURL);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getNutritionFromLabel = async (label) => {
    try {
      // Nutrition estimate
      const nutritionRes = await fetch(
        `https://api.spoonacular.com/recipes/guessNutrition?title=${encodeURIComponent(label)}&apiKey=${process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY}`
      );
      const nutritionData = await nutritionRes.json();

      // Vegetarian check
      const vegRes = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(label)}&addRecipeInformation=true&number=1&apiKey=${process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY}`
      );
      const vegData = await vegRes.json();

      const isVegetarian = vegData?.results?.[0]?.vegetarian ? "Yes" : "No";

      return {
        calories: nutritionData?.calories?.value ? Math.round(nutritionData.calories.value) : "N/A",
        vegetarian: isVegetarian,
        halal: "Unknown"
      };
    } catch (err) {
      console.error("Spoonacular API error:", err);
      return {
        calories: "N/A",
        vegetarian: "N/A",
        halal: "Unknown"
      };
    }
  };

  const analyzeWithVision = async (imageURL) => {
    setLoading(true);
    let finalLabel = "Unknown food";

    try {
      const blob = await fetch(imageURL).then(res => res.blob());
      const base64 = await blobToBase64(blob);

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.NEXT_PUBLIC_GCP_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [
                  { type: "LABEL_DETECTION", maxResults: 5 },
                  { type: "WEB_DETECTION", maxResults: 5 }
                ]
              }
            ]
          })
        }
      );

      const result = await response.json();
      console.log("Vision API response:", result);

      const bestGuess = result?.responses?.[0]?.webDetection?.bestGuessLabels?.[0]?.label;
      const label = result?.responses?.[0]?.labelAnnotations?.[0]?.description;

      finalLabel = bestGuess || label || "Unknown food";

    } catch (err) {
      console.error("Vision API error:", err);
    }

    // Continue regardless of above failure
    try {
      const facts = await getNutritionFromLabel(finalLabel);
      setLoading(false);
      console.log(facts)
      onResult({
        name: finalLabel,
        calories: facts.calories,
        vegetarian: facts.vegetarian,
        halal: facts.halal,
        preview: imageURL
      });
      setPreview(null);
    } catch (err) {
      setLoading(false);
      console.error("Final fallback failed:", err);
      onResult({
        name: finalLabel,
        calories: "N/A",
        vegetarian: "N/A",
        halal: "N/A",
        preview: imageURL
      });
      setPreview(null);
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3">🍽️ Identify Your Food</h3>

      <div className="space-y-3">
        {!streaming ? (
          <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            📷 Take a Photo Now
          </button>
        ) : (
          <div className="mb-3">
            <video ref={videoRef} autoPlay playsInline className="w-64 rounded shadow" />
            <button onClick={capturePhoto} className="bg-green-600 text-white mt-2 px-4 py-2 rounded w-full">
              ✅ Capture
            </button>
          </div>
        )}

        <button onClick={triggerFileInput} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          📤 Upload a Photo
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {preview && (
          <div className="flex justify-center">
            <img src={preview} alt="Selected" className="w-64 rounded shadow mb-3" />
          </div>
        )}

        {loading && <p className="text-blue-600 text-sm">Analyzing image...</p>}
      </div>
    </div>
  );
}
