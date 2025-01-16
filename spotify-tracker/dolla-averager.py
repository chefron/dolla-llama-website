import pandas as pd

def calculate_dolla_averages(input_file, output_file):
    # Read the catalog file
    df = pd.read_csv(input_file)
    
    # Calculate averages for the relevant columns
    averages = {
        'Danceable': round(df['Dance'].mean(), 1),
        'Energetic': round(df['Energy'].mean(), 1),
        'Live': round(df['Live'].mean(), 1),
        'Acoustic': round(df['Acoustic'].mean(), 1),
        'Happy': round(df['Happy'].mean(), 1),
        'Speechy': round(df['Speech'].mean(), 1),
        'Instrumental': round(df['Instrumental'].mean(), 1)
    }
    
    # Convert to DataFrame and save
    averages_df = pd.DataFrame([averages])
    averages_df.to_csv(output_file, index=False)
    print(f"Averages saved to {output_file}")
    print("Calculated averages:", averages)

if __name__ == "__main__":
    calculate_dolla_averages('dolla_catalog.csv', 'dolla_averages.csv')