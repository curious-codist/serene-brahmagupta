import os
import urllib.request
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, 'downloaded_datasets')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# List of official NCPOR datasets from http://data.ncaor.gov.in/newhtml/1
NCPOR_DATASETS = [
    {
        "id": "41",
        "station": "Maitri Station",
        "title": "Surface Data (IMD)",
        "duration": "31/12/2018 - 30/11/2022",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/41",
        "file_details": "http://data.ncaor.gov.in/static/datasets/maitri_1990-2019_SurfaceTableII.txt"
    },
    {
        "id": "70",
        "station": "Maitri Station",
        "title": "Automatic Weather Station (AWS) Datasets (IMD)",
        "duration": "01/01/1985 - 19/12/2016",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/70",
        "file_details": "http://data.ncaor.gov.in/static/datasets/m_imd_aws.txt"
    },
    {
        "id": "40",
        "station": "Maitri Station",
        "title": "High Speed Wind Recorder (IMD)",
        "duration": "01/01/2015 - 31/12/2019",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/40",
        "file_details": "http://data.ncaor.gov.in/static/datasets/m_imd_hswr.txt"
    },
    {
        "id": "42",
        "station": "Maitri Station",
        "title": "Hydrographic Data (NCPOR)",
        "duration": "01/01/2013 - 31/12/2017",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/42",
        "file_details": "http://data.ncaor.gov.in/static/datasets/m_ncpor_hydrographic.txt"
    },
    {
        "id": "52",
        "station": "Bharati Station",
        "title": "Surface Data (IMD)",
        "duration": "31/12/2018 - 30/11/2022",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/52",
        "file_details": "http://data.ncaor.gov.in/static/datasets/Bharati_Dec2018_Nov2022_SurfaceTableII.txt"
    },
    {
        "id": "75",
        "station": "Bharati Station",
        "title": "Automatic Weather Station Datasets (IMD)",
        "duration": "06/02/2015 - 13/11/2016",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/75",
        "file_details": "http://data.ncaor.gov.in/static/datasets/b_imd_aws.txt"
    },
    {
        "id": "67",
        "station": "Dakshin Gangotri",
        "title": "Surface Data (IMD)",
        "duration": "01/01/1982 - 31/12/1985",
        "portal_page": "http://data.ncaor.gov.in/newhtml/download/67",
        "file_details": "http://data.ncaor.gov.in/static/datasets/gangotri_surface_data_1982_1990.txt"
    }
]

# External Satellite & Iceberg Public Open Datasets
EXTERNAL_BENCHMARK_DATASETS = [
    {
        "title": "NSIDC Southern Ocean Daily Sea Ice Concentration Grids (G02135)",
        "provider": "NSIDC / NASA Earthdata",
        "download_url": "https://noaadata.apps.nsidc.org/NOAA/g02135/south/daily/",
        "type": "Satellite Microwave (NetCDF / GeoTIFF)"
    },
    {
        "title": "US National Ice Center (NIC) Antarctic Iceberg Tracking Database",
        "provider": "US National Ice Center / NOAA",
        "download_url": "https://usicecenter.gov/Products/AntarcticIcebergs",
        "type": "CSV / Shapefile GPS Iceberg Tracks"
    },
    {
        "title": "Copernicus Ocean Physics Reanalysis (CMEMS Global Ocean 1/12°)",
        "provider": "Copernicus Marine Service",
        "download_url": "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/",
        "type": "Ocean Current Velocities (u, v) & Temperature"
    },
    {
        "title": "ECMWF ERA5 Reanalysis 10m Wind & Surface Pressure",
        "provider": "ECMWF / Climate Data Store (CDS)",
        "download_url": "https://cds.climate.copernicus.eu/cdsapp#!/dataset/reanalysis-era5-single-levels",
        "type": "NetCDF / GRIB Global Weather"
    }
]

def fetch_data_details():
    """Downloads dataset metadata text files directly from NCPOR portal static storage."""
    print("=== Downloading NCPOR Dataset Metadata & Sample Files ===")
    for ds in NCPOR_DATASETS:
        filename = os.path.basename(ds["file_details"])
        target_path = os.path.join(DOWNLOAD_DIR, filename)
        print(f"Downloading detail file for ID {ds['id']} ({ds['title']})...")
        try:
            req = urllib.request.Request(
                ds["file_details"], 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req) as resp, open(target_path, 'wb') as out:
                out.write(resp.read())
            print(f"  ✓ Saved to {target_path}")
        except Exception as e:
            print(f"  × Direct fetch notice: {e}. Page link: {ds['portal_page']}")

    manifest_path = os.path.join(DOWNLOAD_DIR, 'dataset_manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump({
            "ncpor_datasets": NCPOR_DATASETS,
            "external_datasets": EXTERNAL_BENCHMARK_DATASETS
        }, f, indent=2)
    print(f"\nManifest saved to {manifest_path}")

if __name__ == "__main__":
    fetch_data_details()
