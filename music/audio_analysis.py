import librosa
import numpy as np
import scipy.stats
from scipy.signal import find_peaks
import sys
import csv
import os

def analyze_audio(file_path):
    """
    Analyze audio file to extract audio features using librosa.
    
    Parameters:
    file_path (str): Path to the audio file
    
    Returns:
    dict: Dictionary containing audio features
    """
    # Load the audio file
    y, sr = librosa.load(file_path, sr=22050)
    
    # Get track duration
    duration_ms = len(y) / sr * 1000
    
    # Compute the mel spectrogram
    mel_spec = librosa.feature.melspectrogram(y=y, sr=sr)
    mel_db = librosa.power_to_db(mel_spec, ref=np.max)
    
    # Compute tempo and beat features
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
    
    # Compute RMS energy
    rms = librosa.feature.rms(y=y)[0]
    
    # Compute spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
    
    # Compute harmonic and percussive components
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    
    # Calculate key and mode
    chromagram = librosa.feature.chroma_cqt(y=y, sr=sr)
    key = np.argmax(np.mean(chromagram, axis=1))
    
    # Estimate mode (major/minor) using harmonic content
    mode_strength = np.std(chromagram, axis=0).mean()
    mode = int(mode_strength > 0.5)  # 0 for minor, 1 for major
    
    # Calculate danceability
    pulse_clarity = np.mean(pulse)
    tempo_weight = min((tempo - 50) / 120, 1.0) if tempo > 50 else 0
    danceability = 0.5 * pulse_clarity + 0.5 * tempo_weight
    
    # Calculate energy
    energy = np.mean(rms) * 2  # Scale up RMS energy
    
    # Calculate acousticness using harmonic-percussive separation
    harmonic_energy = np.mean(librosa.feature.rms(y=y_harmonic)[0])
    percussive_energy = np.mean(librosa.feature.rms(y=y_percussive)[0])
    acousticness = harmonic_energy / (harmonic_energy + percussive_energy + 1e-6)
    
    # Calculate instrumentalness using zero crossing rate variability
    zcr_std = np.std(zero_crossing_rate)
    instrumentalness = 1.0 - min(1.0, zcr_std * 4)
    
    # Calculate speechiness using zero crossing rate and spectral rolloff
    mean_zcr = np.mean(zero_crossing_rate)
    mean_rolloff = np.mean(spectral_rolloff)
    speechiness = min(1.0, (mean_zcr * mean_rolloff / sr) * 20)
    
    # Calculate liveness using dynamic range
    peak_rms = np.max(rms)
    mean_rms = np.mean(rms)
    dynamic_range = peak_rms - mean_rms
    liveness = min(1.0, dynamic_range * 4)
    
    # Calculate valence using spectral features and tempo
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    valence_spectral = np.mean(spectral_contrast[1:, :]) / 100
    valence_tempo = (tempo - 50) / 150 if tempo > 50 else 0
    valence = 0.5 * valence_spectral + 0.5 * valence_tempo
    
    # Helper function to safely convert numpy values to float
    def safe_float(value):
        if isinstance(value, np.ndarray):
            return float(value.item())
        return float(value)
    
    # Convert tempo considering potential double-time feel
    estimated_tempo = safe_float(tempo)
    if estimated_tempo > 140:  # If tempo is very high, consider it might be double-time
        estimated_tempo = estimated_tempo / 2

    # Map key number to musical key
    key_map = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    musical_key = f"{key_map[key]}{'m' if mode == 0 else ''}"

    # Normalize all features to [0,1] range where applicable
    results = {
        'Song': os.path.splitext(os.path.basename(file_path))[0],
        'Length': f"{int(duration_ms/1000/60)}:{int((duration_ms/1000)%60):02d}",
        'Key': musical_key,
        'BPM': int(round(estimated_tempo)),
        'Acoustic': safe_float(min(1.0, max(0.0, acousticness))),
        'Danceable': safe_float(min(1.0, max(0.0, danceability))),
        'Energetic': safe_float(min(1.0, max(0.0, energy))),
        'Instrumental': safe_float(min(1.0, max(0.0, instrumentalness))),
        'Live': safe_float(min(1.0, max(0.0, liveness))),
        'Speechy': safe_float(min(1.0, max(0.0, speechiness))),
        'Happy': safe_float(min(1.0, max(0.0, valence)))
    }
    
    return results

def write_to_csv(results, output_file='audio_features.csv'):
    """
    Write analysis results to a CSV file.
    
    Parameters:
    results (dict): Analysis results
    output_file (str): Name of the output CSV file
    """
    # Define the order of columns
    fieldnames = ['Song', 'BPM', 'Length', 'Key', 'Danceable', 'Energetic', 
                 'Acoustic', 'Instrumental', 'Happy', 'Speechy', 'Live']
    
    # Check if file exists to determine if we need to write headers
    file_exists = os.path.isfile(output_file)
    
    with open(output_file, mode='a', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        
        # Write headers only if file doesn't exist
        if not file_exists:
            writer.writeheader()
        
        # Write the results
        writer.writerow(results)

def main():
    if len(sys.argv) < 2:
        print("Please provide an audio file name.")
        print("Usage: python audio_analysis.py <audio_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)
    
    try:
        results = analyze_audio(file_path)
        write_to_csv(results)
        print(f"Analysis complete. Results written to audio_features.csv")
    except Exception as e:
        print(f"Error analyzing file: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()