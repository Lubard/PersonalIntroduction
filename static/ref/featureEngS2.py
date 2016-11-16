import re
import collections


def featureEng(fin,featurein,locations):
    dict = {}
    for location in locations:
        dict[location] = {}
    features = open(featurein,'r')
    for feature in features:
        bag_of_features = feature.split()
        dict[bag_of_features[-1]][bag_of_features[0]]={"chi_square":bag_of_features[1],"count":0,"frequent":0}
        f = open(fin,'r')
        for line in f:
            bag_of_words = line.split()
            if bag_of_features[0] in line:
                dict[bag_of_features[-1]][bag_of_features[0]]["count"] += 1
                if bag_of_words[-1].lower() == bag_of_features[-1]:
                    dict[bag_of_features[-1]][bag_of_features[0]]["frequent"] += 1
    f.close()
    features.close()
    writeToFile(dict,"count.txt")


def writeToFile(dict,fout):
        f = open(fout,'w')
        for location,term in dict.iteritems():
            for feature,count in term.iteritems():
                s = str(feature) +","+ str(count["count"])+","+ str(count["frequent"])+","+ str(count["chi_square"]) +","+ str(location.upper())+"\n"
                f.write(s)
        f.close()

featureEng("train-tweets.txt","features.txt",['b','h','sd','se','w'])
