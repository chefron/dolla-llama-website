import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import schedule
import time
import os
from datetime import datetime

def time_to_seconds(time_str):
    """Convert MM:SS format to seconds"""
    minutes, seconds = map(int, time_str.split(':'))
    return minutes * 60 + seconds

def export_playlist_data(playlist_uri):
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Clean up existing files
    for filename in os.listdir(script_dir):
        if filename.startswith("Top 50 - USA") and filename.endswith(".csv"):
            try:
                os.remove(os.path.join(script_dir, filename))
            except Exception as e:
                print(f"Error removing old file {filename}: {str(e)}")
    
    chrome_options = webdriver.ChromeOptions()
    prefs = {
        "download.default_directory": script_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    service = Service('/usr/local/bin/chromedriver')
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get("https://www.chosic.com/spotify-playlist-analyzer/")
        
        search_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "search-word"))
        )
        search_field.send_keys(playlist_uri)
        
        analyze_button = driver.find_element(By.ID, "analyze")
        analyze_button.click()
        
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.ID, "all-tracks-table"))
        )
        
        time.sleep(10)
        
        export_button = driver.find_element(By.ID, "export")
        driver.execute_script("arguments[0].scrollIntoView(true);", export_button)
        time.sleep(5)
        driver.execute_script("arguments[0].click();", export_button)
        
        time.sleep(5)
        
    finally:
        if driver:
            driver.quit()

def process_data():
    """Process the downloaded CSV and extract averages"""
    # Read the CSV file
    df = pd.read_csv('Top 50 - USA.csv')
    
    # Rename columns
    header_changes = {
        'Time': 'Length',
        'Dance': 'Danceable',
        'Energy': 'Energetic',
        'Speech': 'Speechy'
    }
    df = df.rename(columns=header_changes)
    
    # Calculate averages
    averages = {
        'Danceable': round(df['Danceable'].mean(), 1),
        'Energetic': round(df['Energetic'].mean(), 1),
        'Live': round(df['Live'].mean(), 1),
        'Acoustic': round(df['Acoustic'].mean(), 1),
        'Happy': round(df['Happy'].mean(), 1),
        'Speechy': round(df['Speechy'].mean(), 1),
        'Instrumental': round(df['Instrumental'].mean(), 1)
    }
    
    # Save averages with timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d')
    averages['date'] = timestamp
    
    # Append to historical data file
    try:
        history_df = pd.read_csv('historical_averages.csv')
    except FileNotFoundError:
        history_df = pd.DataFrame()
    
    history_df = pd.concat([history_df, pd.DataFrame([averages])], ignore_index=True)
    history_df.to_csv('historical_averages.csv', index=False)
    
    # Save today's averages for the chart
    pd.DataFrame([averages]).to_csv('current_averages.csv', index=False)
    
    print(f"Data processed and saved for {timestamp}")

def daily_task():
    """Run the complete daily update process"""
    playlist_uri = "spotify:playlist:37i9dQZEVXbLRQDuF5jeBp"  # Top 50 USA playlist
    try:
        print("Starting daily update...")
        export_playlist_data(playlist_uri)
        time.sleep(10)  # Wait for download to complete
        process_data()
        print("Daily update completed successfully")
    except Exception as e:
        print(f"Error during daily update: {str(e)}")

if __name__ == "__main__":
    # Schedule the task to run daily at 1 AM
    schedule.every().day.at("01:00").do(daily_task)
    
    # Run once immediately on script start
    daily_task()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)