#!/usr/bin/env python3
"""
Arabic Audio Generation Script
Uses Spark-TTS Arabic model to generate audio files for Salah Companion app.

Prerequisites:
    git clone https://github.com/SparkAudio/Spark-TTS
    cd Spark-TTS
    pip install transformers soundfile huggingface_hub omegaconf torch

Usage:
    python scripts/generate-arabic-audio.py
"""

import sys
import os
import platform
from pathlib import Path

# Add Spark-TTS to path (adjust if different location)
SPARK_TTS_PATH = os.path.join(os.path.dirname(__file__), '..', 'Spark-TTS')
if os.path.exists(SPARK_TTS_PATH):
    sys.path.insert(0, SPARK_TTS_PATH)

try:
    from huggingface_hub import snapshot_download
    import torch
    import soundfile as sf
    from cli.SparkTTS import SparkTTS
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("\n📦 Install dependencies:")
    print("   pip install transformers soundfile huggingface_hub omegaconf torch")
    sys.exit(1)

# Output directory for generated audio files
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "audio"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Model configuration
MODEL_REPO_ID = "azeddinShr/Spark-TTS-Arabic-Complete"
MODEL_DIR = Path(__file__).parent.parent / "models" / "spark-tts-arabic"

# Global model instance (initialized once)
_model_instance = None

def get_device():
    """Get the appropriate device for inference."""
    if platform.system() == "Darwin" and torch.backends.mps.is_available():
        # macOS with MPS support (Apple Silicon)
        device = torch.device("mps:0")
        print(f"✅ Using MPS device: {device}")
    elif torch.cuda.is_available():
        # System with CUDA support
        device = torch.device("cuda:0")
        print(f"✅ Using CUDA device: {device}")
    else:
        # Fall back to CPU
        device = torch.device("cpu")
        print("⚠️  GPU acceleration not available, using CPU (this will be slower)")
    return device

def download_model():
    """Download the Spark-TTS Arabic model from Hugging Face."""
    if MODEL_DIR.exists() and any(MODEL_DIR.iterdir()):
        print(f"✅ Model already exists at: {MODEL_DIR}")
        return str(MODEL_DIR)
    
    print("📥 Downloading Spark-TTS Arabic model...")
    print("   This may take a while (model is large)...")
    try:
        model_path = snapshot_download(
            repo_id=MODEL_REPO_ID,
            local_dir=str(MODEL_DIR),
            local_dir_use_symlinks=False
        )
        print(f"✅ Model downloaded to: {model_path}")
        return model_path
    except Exception as e:
        print(f"❌ Error downloading model: {e}")
        print("\n💡 Make sure you have:")
        print("   1. Cloned Spark-TTS: git clone https://github.com/SparkAudio/Spark-TTS")
        print("   2. Installed dependencies: pip install transformers soundfile huggingface_hub omegaconf torch")
        sys.exit(1)

def initialize_model():
    """Initialize the Spark-TTS model (singleton pattern)."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance
    
    print("🔧 Initializing Spark-TTS model...")
    model_path = download_model()
    device = get_device()
    
    try:
        _model_instance = SparkTTS(model_path, device)
        print("✅ Model initialized successfully")
        return _model_instance
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        print("\n💡 Make sure:")
        print("   1. The model directory contains config.yaml and LLM/ subdirectory")
        print("   2. All model files are downloaded correctly")
        raise

def generate_audio(
    text: str,
    output_path: Path,
    gender: str = "male",
    pitch: str = "moderate",
    speed: str = "moderate",
    prompt_speech_path: str = None,
    prompt_text: str = None,
):
    """
    Generate audio file from Arabic text using Spark-TTS.
    
    Args:
        text: Arabic text to convert to speech
        output_path: Path to save audio file (WAV format)
        gender: Voice gender ("male" or "female") - for controlled generation
        pitch: Pitch level ("very_low", "low", "moderate", "high", "very_high")
        speed: Speed level ("very_low", "low", "moderate", "high", "very_high")
        prompt_speech_path: Path to prompt audio file (for voice cloning)
        prompt_text: Transcript of prompt audio (for voice cloning)
    """
    try:
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize model if needed
        model = initialize_model()
        
        # Generate audio
        print(f"🎙️  Generating audio for: {text[:50]}...")
        
        if prompt_speech_path and os.path.exists(prompt_speech_path):
            # Voice cloning mode
            wav = model.inference(
                text=text,
                prompt_speech_path=prompt_speech_path,
                prompt_text=prompt_text,
            )
        else:
            # Controlled generation mode (no prompt)
            wav = model.inference(
                text=text,
                gender=gender,
                pitch=pitch,
                speed=speed,
            )
        
        # Convert tensor to numpy array if needed
        if isinstance(wav, torch.Tensor):
            wav = wav.cpu().numpy()
        
        # Get sample rate from model config
        sample_rate = model.sample_rate
        
        # Save audio file
        sf.write(str(output_path), wav, sample_rate)
        print(f"✅ Audio saved: {output_path}")
        
    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        raise

def generate_quran_audio():
    """Generate audio files for Quranic content."""
    print("\n📖 Generating Quran audio files...")
    
    # Example: Al-Fatiha (first 7 ayahs)
    quran_texts = [
        {"surah": 1, "ayah": 1, "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"},
        {"surah": 1, "ayah": 2, "text": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"},
        {"surah": 1, "ayah": 3, "text": "الرَّحْمَٰنِ الرَّحِيمِ"},
        {"surah": 1, "ayah": 4, "text": "مَالِكِ يَوْمِ الدِّينِ"},
        {"surah": 1, "ayah": 5, "text": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"},
        {"surah": 1, "ayah": 6, "text": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ"},
        {"surah": 1, "ayah": 7, "text": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"},
    ]
    
    for item in quran_texts:
        output_path = OUTPUT_DIR / "quran" / f"surah_{item['surah']:03d}" / f"ayah_{item['ayah']:03d}.wav"
        generate_audio(item['text'], output_path, gender="male", pitch="moderate", speed="moderate")

def generate_prayer_phrases_audio():
    """Generate audio files for prayer phrases."""
    print("\n🕌 Generating prayer phrase audio files...")
    
    prayer_phrases = {
        "takbir": "الله أكبر",
        "ruku": "سبحان ربي العظيم",
        "sujud": "سبحان ربي الأعلى",
        "tashahhud": "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
        "salam": "السلام عليكم ورحمة الله",
        "subhan_rabbial_ala": "سبحان ربي الأعلى",
        "subhan_rabbial_azeem": "سبحان ربي العظيم",
        "sami_allahu_liman_hamidah": "سمع الله لمن حمده",
        "rabbana_lakal_hamd": "ربنا ولك الحمد",
    }
    
    for phrase_id, text in prayer_phrases.items():
        output_path = OUTPUT_DIR / "prayers" / f"{phrase_id}.wav"
        generate_audio(text, output_path, gender="male", pitch="moderate", speed="moderate")

def generate_azan_audio():
    """Generate audio files for Azan phrases."""
    print("\n📢 Generating Azan audio files...")
    
    azan_phrases = {
        "allahu_akbar": "الله أكبر",
        "ashhadu_la_ilaha": "أشهد أن لا إله إلا الله",
        "ashhadu_muhammadan": "أشهد أن محمداً رسول الله",
        "hayya_ala_salah": "حي على الصلاة",
        "hayya_ala_falah": "حي على الفلاح",
        "as_salatu_khayrun": "الصلاة خير من النوم",
        "la_ilaha_illa_allah": "لا إله إلا الله",
    }
    
    for phrase_id, text in azan_phrases.items():
        output_path = OUTPUT_DIR / "azan" / f"{phrase_id}.wav"
        # Azan is typically recited by a male voice with moderate pitch
        generate_audio(text, output_path, gender="male", pitch="moderate", speed="moderate")

def main():
    """Main function to generate all audio files."""
    print("🎙️  Arabic Audio Generation Script")
    print("=" * 50)
    print("")
    
    # Download model if needed (will be done during initialization)
    # Generate audio files
    try:
        # Initialize model first (downloads if needed)
        initialize_model()
        
        # Generate audio files
        generate_quran_audio()
        generate_prayer_phrases_audio()
        generate_azan_audio()
        
        print("\n" + "=" * 50)
        print("✅ Audio generation complete!")
        print(f"📁 Audio files saved to: {OUTPUT_DIR}")
        print("")
        print("💡 Next steps:")
        print("   1. Review generated audio files for quality")
        print("   2. Copy audio files to React Native assets directory")
        print("   3. Update audio service to use generated files")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during audio generation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

