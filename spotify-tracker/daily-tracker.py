import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from datetime import datetime

def time_to_seconds(time_str):
    """Convert MM:SS format to seconds"""
    minutes, seconds = map(int, time_str.split(':'))
    return minutes * 60 + seconds

def export_playlist_data(playlist_uri):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Script directory: {script_dir}")

    # Clean up existing files
    for filename in os.listdir(script_dir):
        if filename.startswith("Billboard Hot 100") and filename.endswith(".csv"):
            try:
                os.remove(os.path.join(script_dir, filename))
                print(f"Removed old file: {filename}")
            except Exception as e:
                print(f"Error removing old file {filename}: {str(e)}")
    
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    prefs = {
        "download.default_directory": script_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
        "profile.default_content_settings.popups": 0
    }
    chrome_options.add_experimental_option("prefs", prefs)
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    print("Creating Chrome driver...")
    
    # Start Xvfb
    from xvfbwrapper import Xvfb
    print("Starting Xvfb...")
    vdisplay = Xvfb()
    vdisplay.start()
    
    service = Service('/usr/local/bin/chromedriver')
    driver = None
    
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("Chrome driver created successfully")
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(20)
        
        print("Navigating to website...")
        driver.get("https://www.chosic.com/spotify-playlist-analyzer/")
        print("Website loaded successfully")
        
        print("Looking for search field...")
        search_field = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "search-word"))
        )
        search_field.send_keys(playlist_uri)
        print("Found and filled search field")
        
        print("Looking for analyze button...")
        analyze_button = driver.find_element(By.ID, "analyze")
        analyze_button.click()
        print("Clicked analyze button")
        
        print("Waiting for results table...")
        WebDriverWait(driver, 45).until(
            EC.presence_of_element_located((By.ID, "all-tracks-table"))
        )
        print("Results table loaded")
        
        time.sleep(15)
        
        print("Looking for export button...")
        try:
            export_button = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.ID, "export"))
            )
            print("Found export button")
            
            # Try to make sure the button is clickable
            WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.ID, "export"))
            )
            print("Export button is clickable")
            
            # Scroll to button
            driver.execute_script("arguments[0].scrollIntoView(true);", export_button)
            print("Scrolled to export button")
            time.sleep(8)
            
            # Try direct click first
            try:
                export_button.click()
                print("Clicked export button directly")
            except Exception as click_error:
                print(f"Direct click failed: {str(click_error)}")
                # If direct click fails, try JavaScript click
                driver.execute_script("arguments[0].click();", export_button)
                print("Clicked export button via JavaScript")
            
            print("Export button clicked successfully")
            
            # Now wait for file download
            print("Waiting for file download...")
            max_wait = 30
            start_time = time.time()
            file_found = False
            
            while time.time() - start_time < max_wait:
                for filename in os.listdir(script_dir):
                    if filename.startswith("Billboard Hot 100") and (filename.endswith(".csv") or filename.endswith(".crdownload")):
                        print(f"Found file: {filename}")
                        full_path = os.path.join(script_dir, filename)
                        
                        if filename.endswith(".crdownload"):
                            print("File is still downloading, waiting...")
                            # Wait for download to complete (file to lose .crdownload extension)
                            download_wait = 0
                            while download_wait < 30:  # Wait up to 30 seconds
                                time.sleep(1)
                                download_wait += 1
                                # Check if the .crdownload version disappeared and regular file exists
                                if not os.path.exists(full_path) and os.path.exists(full_path[:-11]):
                                    filename = filename[:-11]  # Remove .crdownload extension
                                    full_path = os.path.join(script_dir, filename)
                                    print(f"Download completed: {filename}")
                                    break
                            
                            if download_wait >= 30:
                                raise Exception("Download did not complete in time")
                        
                        # Now handle the file as before
                        if filename != "Billboard Hot 100.csv":
                            new_path = os.path.join(script_dir, "Billboard Hot 100.csv")
                            os.rename(full_path, new_path)
                            print(f"Renamed file to: Billboard Hot 100.csv")
                        file_found = True
                        break
                if file_found:
                    break
                time.sleep(1)
                print("Still waiting for file...")
            
            if not file_found:
                raise Exception("Download timeout: CSV file not found")
                
            # Verify file exists and is non-empty before closing browser
            final_path = os.path.join(script_dir, "Billboard Hot 100.csv")
            if not os.path.exists(final_path):
                raise Exception("File not found after download")
            if os.path.getsize(final_path) == 0:
                raise Exception("Downloaded file is empty")
            
            print(f"File verified at {final_path} with size {os.path.getsize(final_path)} bytes")
            # Wait a bit more after verification
            time.sleep(5)
            
        except Exception as e:
            print(f"Error with export button or download: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Error during execution: {str(e)}")
        raise
    finally:
        if driver:
            print("Closing Chrome driver...")
            driver.quit()
            print("Chrome driver closed")
        vdisplay.stop()
        print("Stopped Xvfb")

def process_data():
    """Process the downloaded CSV and extract averages"""
    # Read the CSV file
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Billboard Hot 100.csv")
    df = pd.read_csv(csv_path)
    
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
    playlist_uri = "spotify:playlist:6UeSakyzhiEt4NB3UAd6NQ"  # Billboard Hot 100
    try:
        print("Starting daily update...")
        export_playlist_data(playlist_uri)
        
        # Verify file exists before processing
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Billboard Hot 100.csv")
        print(f"Checking for file at: {csv_path}")
        if not os.path.exists(csv_path):
            raise Exception(f"CSV file not found at {csv_path}")
        print(f"File exists with size: {os.path.getsize(csv_path)} bytes")
        
        time.sleep(15)  # Wait a bit more
        process_data()
        print("Daily update completed successfully")
    except Exception as e:
        print(f"Error during daily update: {str(e)}")

if __name__ == "__main__":
    playlist_uri = "spotify:playlist:6UeSakyzhiEt4NB3UAd6NQ"  # Billboard Hot 100 playlist
    daily_task()