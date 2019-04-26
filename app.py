import os
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import urllib
import json
import pandas as pd

app = Flask(__name__)

# Info for local connection to MongoDB
DBS_NAME = os.getenv('DBS_NAME', 'language_popularity')
COLLECTION_NAME = 'stackoverflow'

# Routes
@app.route("/")
def index():
    """
    A Flask view to serve the main dashboard page.
    """
    return render_template("index.html")

# This is called just once. For populating the remote MongoDB
# @app.route("/init")
# def init_data():
    # df = pd.read_csv("survey_results_public.csv")
    # df.fillna(str('NA'), inplace=True)
    # with MongoClient(MONGODB_URI) as connection:
    #     # Define which collection we wish to access
    #     collection = connection[DBS_NAME][COLLECTION_NAME]
    #     # Retrieve a result set only with the fields defined in FIELDS
    #
        # for rec in df.iloc[5:].to_dict('records'):
        #     collection.insert_one(rec)
    #
    #     # Convert projects to a list in a JSON object and return the JSON data
    #     projects = collection.find();
    #     print(json.dumps(list(projects)));

@app.route("/data")
def dummy():
    """
    A Flask view to serve projected data from MongoDB in JSON format
    """
    # A constant that defines the record fields that we wish to retrieve
    # Need to explicitly exclude '_id' field as it it automatically included in the returned documents
    FIELDS = {
        '_id': False,
        'Professional': True,
        'Country': True,
        'Employment': True,
        'FormalEducation': True,
        'UndergradMajor': True,
        'YearsProgram': True,
        'DevType': True,
        'EducationTypes': True,
        'LanguageWorkedWith': True,
        'FrameworkWorkedWith': True,
        'DatabaseWorkedWith': True,
        'IDE': True,
        'VersionControl': True,
        'Gender': True,
        'Age': True
    }

    # Open a connection to MongoDB using a 'with' statement such that the
    # connection will be closed as soon as we exit the 'with' statement
    with MongoClient(MONGODB_URI) as connection:
        # Define which collection we wish to access
        collection = connection[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        projects = collection.find(projection=FIELDS, limit=1000)

        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))

if __name__ == '__main__':
    app.run(debug=True)