import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Flashlight, 
  Info,
  Clock,
  Heart,
  Plus,
  Minus,
  Trash2,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface Medicine {
  id: string;
  name: string;
  form: string;
  dosage: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  deliveryTime: string;
  description: string;
  usage: string;
  sideEffects?: string;
}

const MEDICINES: Medicine[] = [
  { 
    id: '1', 
    name: 'Paracetamol', 
    form: 'Tablet', 
    dosage: '500mg', 
    price: 15, 
    category: 'Tablets', 
    stock: 50, 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'Commonly used for pain relief and reducing fever. Effective for headaches, muscle aches, and common colds.',
    usage: 'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
    sideEffects: 'Rare, but may include skin rash or liver damage if taken in excess.'
  },
  { 
    id: '2', 
    name: 'Amoxicillin', 
    form: 'Capsule', 
    dosage: '250mg', 
    price: 45, 
    category: 'Tablets', 
    stock: 20, 
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '45-60 mins',
    description: 'A penicillin-type antibiotic used to treat various bacterial infections like pneumonia, bronchitis, and infections of the ear, nose, throat, or skin.',
    usage: 'Take one capsule three times a day, usually every 8 hours. Complete the full course as prescribed.',
    sideEffects: 'Nausea, vomiting, diarrhea, or skin rash.'
  },
  { 
    id: '3', 
    name: 'Benylin Cough', 
    form: 'Syrup', 
    dosage: '100ml', 
    price: 120, 
    category: 'Syrups', 
    stock: 15, 
    image: 'https://images.unsplash.com/photo-1550573105-4584e7d7e674?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'Relieves chesty coughs and helps clear congestion. Contains active ingredients to loosen phlegm.',
    usage: 'Adults: Two 5ml spoonfuls four times daily. Do not take more than 4 doses in 24 hours.',
    sideEffects: 'Drowsiness, dizziness, or stomach upset.'
  },
  { 
    id: '4', 
    name: 'Hydrocortisone', 
    form: 'Cream', 
    dosage: '15g', 
    price: 85, 
    category: 'Creams', 
    stock: 0, 
    image: 'https://images.unsplash.com/photo-1555633514-abcee6ad93e1?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '1-2 hours',
    description: 'A mild corticosteroid used to reduce inflammation, itching, and redness caused by various skin conditions like eczema or insect bites.',
    usage: 'Apply a thin layer to the affected area 2-3 times daily. Wash hands before and after use.',
    sideEffects: 'Skin thinning or irritation if used for prolonged periods.'
  },
  { 
    id: '5', 
    name: 'Ibuprofen', 
    form: 'Tablet', 
    dosage: '400mg', 
    price: 25, 
    category: 'Tablets', 
    stock: 100, 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'A nonsteroidal anti-inflammatory drug (NSAID) used for pain relief, fever reduction, and reducing inflammation.',
    usage: 'Take 1 tablet every 4-6 hours with food or milk. Do not exceed 3 tablets in 24 hours without medical advice.',
    sideEffects: 'Stomach pain, heartburn, or nausea.'
  },
  { 
    id: '6', 
    name: 'Vitamin C', 
    form: 'Effervescent', 
    dosage: '1000mg', 
    price: 150, 
    category: 'Others', 
    stock: 30, 
    image: 'https://images.unsplash.com/photo-1616671285442-7f9986873917?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'Immune system support and antioxidant protection. Helps in collagen production and iron absorption.',
    usage: 'Dissolve one tablet in a glass of water daily. Drink immediately once dissolved.',
    sideEffects: 'Rare, but high doses may cause stomach cramps or diarrhea.'
  },
  { 
    id: '7', 
    name: 'Cetirizine', 
    form: 'Tablet', 
    dosage: '10mg', 
    price: 35, 
    category: 'Tablets', 
    stock: 45, 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'An antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.',
    usage: 'Take one 10mg tablet once daily. Can be taken with or without food.',
    sideEffects: 'Drowsiness, dry mouth, or fatigue.'
  },
  { 
    id: '8', 
    name: 'Gaviscon', 
    form: 'Liquid', 
    dosage: '200ml', 
    price: 180, 
    category: 'Syrups', 
    stock: 12, 
    image: 'https://images.unsplash.com/photo-1550573105-4584e7d7e674?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '45-60 mins',
    description: 'Relieves heartburn and indigestion by forming a protective layer over the stomach contents.',
    usage: 'Take 10-20ml after meals and at bedtime. Shake the bottle well before use.',
    sideEffects: 'Constipation or diarrhea in rare cases.'
  },
  { 
    id: '9', 
    name: 'Aspirin', 
    form: 'Tablet', 
    dosage: '75mg', 
    price: 20, 
    category: 'Tablets', 
    stock: 60, 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'Low-dose aspirin used to prevent blood clots and reduce the risk of heart attacks and strokes.',
    usage: 'Take one tablet daily with water, preferably after a meal.',
    sideEffects: 'Increased risk of bleeding or stomach irritation.'
  },
  { 
    id: '10', 
    name: 'Ventolin', 
    form: 'Inhaler', 
    dosage: '100mcg', 
    price: 350, 
    category: 'Others', 
    stock: 8, 
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'Relieves symptoms of asthma and COPD by opening up the airways.',
    usage: 'Inhale 1-2 puffs as needed for relief of symptoms. Do not exceed 8 puffs in 24 hours.',
    sideEffects: 'Shakiness, headache, or fast heartbeat.'
  },
  { 
    id: '11', 
    name: 'Metformin', 
    form: 'Tablet', 
    dosage: '500mg', 
    price: 40, 
    category: 'Tablets', 
    stock: 120, 
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '45-60 mins',
    description: 'Used to treat type 2 diabetes by helping to control blood sugar levels.',
    usage: 'Take with meals to reduce stomach side effects. Follow your doctor\'s instructions carefully.',
    sideEffects: 'Nausea, diarrhea, or metallic taste in mouth.'
  },
  { 
    id: '12', 
    name: 'Salbutamol', 
    form: 'Syrup', 
    dosage: '2mg/5ml', 
    price: 95, 
    category: 'Syrups', 
    stock: 25, 
    image: 'https://images.unsplash.com/photo-1550573105-4584e7d7e674?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'A bronchodilator used to treat or prevent bronchospasm in people with reversible obstructive airway disease.',
    usage: 'Take 5-10ml three to four times daily. Shake well before use.',
    sideEffects: 'Tremors, nervousness, or headache.'
  },
  { 
    id: '13', 
    name: 'Clotrimazole', 
    form: 'Cream', 
    dosage: '20g', 
    price: 110, 
    category: 'Creams', 
    stock: 18, 
    image: 'https://images.unsplash.com/photo-1555633514-abcee6ad93e1?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '1-2 hours',
    description: 'An antifungal medication used to treat skin infections such as athlete\'s foot, jock itch, and ringworm.',
    usage: 'Apply a thin layer to the affected area twice daily (morning and evening).',
    sideEffects: 'Skin irritation, redness, or stinging.'
  },
  { 
    id: '14', 
    name: 'Multivitamins', 
    form: 'Capsule', 
    dosage: '30 Caps', 
    price: 250, 
    category: 'Others', 
    stock: 40, 
    image: 'https://images.unsplash.com/photo-1616671285442-7f9986873917?auto=format&fit=crop&q=80&w=400', 
    deliveryTime: '30-45 mins',
    description: 'A combination of many different vitamins that are normally found in foods and other natural sources.',
    usage: 'Take one capsule daily with a meal and plenty of water.',
    sideEffects: 'Rare, but may cause stomach upset or constipation.'
  },
];

const Pharmacy = () => {
  const { t, addToCart, cart, removeFromCart } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'outOfStock' | 'unreadable' | null>(null);
  const [scannedMedicines, setScannedMedicines] = useState<Medicine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolveCaptureRef = useRef<(() => void) | null>(null);

  const categories = ['All', 'Tablets', 'Syrups', 'Creams', 'Others'];

  const filteredMedicines = MEDICINES.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Apply initial torch state if supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: isTorchOn }]
          } as any);
        } catch (e) {
          console.warn("Torch constraint failed:", e);
        }
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      const newState = !isTorchOn;
      try {
        await track.applyConstraints({
          advanced: [{ torch: newState }]
        } as any);
        setIsTorchOn(newState);
      } catch (e) {
        console.error("Failed to toggle torch:", e);
      }
    } else {
      alert("Torch is not supported on this device.");
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const analyzePrescription = async (base64Image: string) => {
    setIsAnalyzing(true);
    setScanResult(null);
    setScannedMedicines([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this image. If it is a medical prescription, extract the names of the medications mentioned. If it is NOT a prescription, or if the text is unreadable, blurred, or contains no identifiable medications, return an empty list. Be extremely strict: do not guess if you are unsure. Only return medications that are clearly visible." },
              { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              medications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of identified medication names"
              },
              isPrescription: {
                type: Type.BOOLEAN,
                description: "Whether the image is a valid medical prescription"
              }
            },
            required: ["medications", "isPrescription"]
          }
        }
      });

      const result = JSON.parse(response.text);
      
      if (!result.isPrescription || result.medications.length === 0) {
        setScanResult('unreadable');
      } else {
        // Map identified names to our catalog
        const found = MEDICINES.filter(med => 
          result.medications.some((name: string) => 
            name.toLowerCase().includes(med.name.toLowerCase()) || 
            med.name.toLowerCase().includes(name.toLowerCase())
          )
        );

        if (found.length > 0) {
          setScanResult('success');
          setScannedMedicines(found);
        } else {
          // Found meds but they are not in our stock
          setScanResult('outOfStock');
        }
      }
    } catch (error) {
      console.error("Prescription analysis error:", error);
      setScanResult('unreadable');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScan = async (isUpload: boolean = false) => {
    let base64Image: string | null = null;

    if (!isUpload) {
      setShowCamera(true);
      await startCamera();
      
      setIsScanning(true);
      // Wait for user to manually trigger capture
      await new Promise<void>(resolve => {
        resolveCaptureRef.current = resolve;
      });
      
      base64Image = captureFrame();
      stopCamera();
      setShowCamera(false);
      setIsScanning(false);
    } else {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      
      setIsScanning(true);
      const reader = new FileReader();
      base64Image = await new Promise((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      setIsScanning(false);
    }

    if (base64Image) {
      await analyzePrescription(base64Image);
    } else {
      setScanResult('unreadable');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleAddToCart = (med: Medicine) => {
    addToCart({
      id: med.id,
      name: med.name,
      price: med.price,
      quantity: 1,
      dosage: med.dosage,
      form: med.form
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              MedLink <span className="text-blue-600">Pharmacy</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
              Professional e-commerce platform for all your medical needs. Fast delivery, verified stock, and secure checkout.
            </p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group"
          >
            <ShoppingCart className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Catalog */}
          <div className="lg:col-span-2 space-y-12">
            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search medications, health products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredMedicines.map((med) => (
                  <motion.div
                    key={med.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                    onClick={() => setSelectedMedicine(med)}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={med.image} 
                        alt={med.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <button className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-colors">
                          <Heart size={18} />
                        </button>
                      </div>
                      {med.stock === 0 && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-full text-sm uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{med.name}</h3>
                          <p className="text-slate-500 text-sm">{med.form} • {med.dosage}</p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{med.price} ETB</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-8 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-emerald-500" />
                          {med.deliveryTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${med.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                          {med.stock > 0 ? 'In Stock' : 'Unavailable'}
                        </div>
                      </div>

                      <button 
                        disabled={med.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(med);
                        }}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                          med.stock > 0 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={20} /> Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Scanner & Info */}
          <div className="space-y-12">
            {/* Prescription Scanner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-white shadow-2xl shadow-blue-200 dark:shadow-none relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                  <Camera size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Scan Your Prescription</h2>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Upload or scan your prescription using your camera. Our AI will identify the medications and check availability instantly.
                </p>

                <div className="space-y-4">
                  <button 
                    onClick={() => handleScan(false)}
                    disabled={isScanning}
                    className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl relative overflow-hidden"
                  >
                    {isScanning || isAnalyzing ? (
                      <>
                        <motion.div 
                          className="absolute inset-0 bg-blue-50/50"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                        <Activity size={20} className="relative z-10" />
                        <span className="relative z-10">{isAnalyzing ? 'Analyzing...' : 'Scanning...'}</span>
                      </>
                    ) : (
                      <>
                        <Camera size={20} /> Start Scanning
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-blue-500/30 backdrop-blur-md text-white font-bold rounded-2xl hover:bg-blue-500/40 transition-all flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Upload size={20} /> Upload Photo
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={() => handleScan(true)}
                  />
                </div>

                {/* Scan Results */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
                    >
                      {scanResult === 'success' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 size={20} /> Prescription Readable
                          </div>
                          <p className="text-sm text-blue-100">We identified {scannedMedicines.length} medications in stock:</p>
                          <div className="space-y-3">
                            {scannedMedicines.map(med => (
                              <div key={med.id} className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                                <span className="font-medium">{med.name}</span>
                                <button 
                                  onClick={() => handleAddToCart(med)}
                                  className="text-xs bg-white text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {scanResult === 'outOfStock' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <AlertCircle size={20} /> Out of Stock
                          </div>
                          <p className="text-sm text-blue-100 leading-relaxed">
                            Sorry, the medication in your prescription is currently unavailable in our inventory. We can notify you when it's back.
                          </p>
                        </div>
                      )}

                      {scanResult === 'unreadable' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-red-400 font-bold">
                            <X size={20} /> Analysis Failed
                          </div>
                          <p className="text-sm text-blue-100 leading-relaxed">
                            We were unable to identify the medications in this prescription. To ensure your safety, we do not provide guesses for unclear text.
                          </p>
                          <div className="p-4 bg-white/5 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
                            <Flashlight size={16} className="shrink-0" />
                            <p>Please try again with a clearer photo, better lighting, or ensure the prescription is not folded.</p>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => handleScan(false)}
                        className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/20"
                      >
                        <Camera size={18} /> Scan Again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Info size={20} className="text-blue-600" /> Delivery Information
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Express Delivery</h4>
                    <p className="text-sm text-slate-500">Most medications delivered within 45-60 minutes in Addis Ababa.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Verified Pharmacy</h4>
                    <p className="text-sm text-slate-500">All medicines are sourced from licensed distributors and checked for quality.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Details Modal */}
      <AnimatePresence>
        {selectedMedicine && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedicine(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 md:inset-x-6 top-[5%] bottom-[5%] md:top-[10%] md:bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-slate-800 z-[70] rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative h-64 shrink-0">
                <img 
                  src={selectedMedicine.image} 
                  alt={selectedMedicine.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedMedicine(null)}
                  className="absolute top-6 right-6 p-3 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="px-3 py-1 bg-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                        {selectedMedicine.category}
                      </span>
                      <h2 className="text-3xl font-bold">{selectedMedicine.name}</h2>
                      <p className="text-blue-200">{selectedMedicine.form} • {selectedMedicine.dosage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">{selectedMedicine.price} ETB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info size={20} className="text-blue-600" /> Description
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedMedicine.description}
                  </p>
                </section>

                <section className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-blue-600" /> How to Take
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {selectedMedicine.usage}
                  </p>
                </section>

                {selectedMedicine.sideEffects && (
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle size={20} className="text-amber-500" /> Possible Side Effects
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedMedicine.sideEffects}
                    </p>
                  </section>
                )}

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} className="text-emerald-500" />
                    Delivery: {selectedMedicine.deliveryTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${selectedMedicine.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {selectedMedicine.stock > 0 ? `${selectedMedicine.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-700 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
                <button 
                  disabled={selectedMedicine.stock === 0}
                  onClick={() => {
                    handleAddToCart(selectedMedicine);
                    setSelectedMedicine(null);
                  }}
                  className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedMedicine.stock > 0 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Camera Viewfinder Overlay */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              {/* Real Camera Feed */}
              <div className="absolute inset-0 bg-black">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <div className="bg-red-500/20 backdrop-blur-md p-6 rounded-3xl border border-red-500/50">
                      <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                      <p className="text-white font-bold">{cameraError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewfinder Frame */}
              <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-white/30 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 border-[40px] border-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-full h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    style={{ position: 'absolute' }}
                  />
                </div>
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
              </div>

              <div className="absolute top-12 left-0 right-0 text-center text-white px-8">
                <h3 className="text-xl font-bold mb-2">Scanning Prescription</h3>
                <p className="text-sm text-white/60">Align the text within the blue frame</p>
              </div>

              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-12 items-center">
                <button 
                  onClick={() => {
                    stopCamera();
                    setShowCamera(false);
                    if (resolveCaptureRef.current) resolveCaptureRef.current();
                  }}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Manual Capture Button */}
                <button 
                  onClick={() => {
                    if (resolveCaptureRef.current) {
                      resolveCaptureRef.current();
                    }
                  }}
                  className="w-20 h-20 bg-white rounded-full border-4 border-blue-600 shadow-2xl flex items-center justify-center group active:scale-90 transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-200 group-hover:border-blue-200 transition-all"></div>
                </button>

                <button 
                  onClick={toggleTorch}
                  className={`p-4 backdrop-blur-md rounded-full text-white transition-all ${isTorchOn ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <Flashlight size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={24} className="text-blue-600" /> Your Cart
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                      <ShoppingCart size={40} />
                    </div>
                    <p className="text-slate-500">Your cart is empty</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 text-blue-600 font-bold hover:underline"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{item.form} • {item.dosage}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-600">{item.price} ETB</span>
                          <div className="flex items-center gap-3">
                            <button className="p-1 hover:text-blue-600 transition-colors"><Minus size={16} /></button>
                            <span className="font-bold text-sm">{item.quantity}</span>
                            <button className="p-1 hover:text-blue-600 transition-colors"><Plus size={16} /></button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-blue-600">{cartTotal} ETB</span>
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pharmacy;
