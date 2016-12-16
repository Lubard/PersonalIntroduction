from flask import Flask, render_template, json
import json
import DataPoints


# EB looks for an 'application' callable by default.
application = Flask(__name__)


@application.route("/")
def main():
    return render_template('bootstrap.html')

@application.route("/AboutMe")
def AboutMe():
    return render_template('AboutMe.html')

@application.route("/Project")
def Project():
    return render_template('Project.html')


@application.route("/QuestionMap")
def QuestionMap():
    return  render_template("QuestionMap.html")

@application.route("/Note")
def ReactNote():
    return  render_template("Note.html")

@application.route("/categoryData", methods = ['GET'])
def categoryData():
    data = DataPoints.categoryData
    return json.dumps(data)

@application.route("/forceData", methods = ['GET'])
def forceData():
    data = DataPoints.forcemapData
    return json.dumps(data)

@application.route("/noteData", methods = ['GET'])
def noteData():
    data = DataPoints.noteData
    return json.dumps(data)

@application.route("/swedish", methods = ['GET'])
def swedish():
    return application.send_static_file("csv/Interestrate and inflation Sweden 1908-2001.csv")

@application.route("/geolocationData", methods = ['GET'])
def twitterData():
    return application.send_static_file("csv/twitter features.csv")


# run the app.
if __name__ == "__main__":
    application.debug = True
    application.run()