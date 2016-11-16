from stemming.porter2 import stem
import re
import collections
from nltk.corpus import stopwords
from nltk.tag import pos_tag

def chi_square(feature,distribute,locate):
    sumOfwords = sum(distribute)
    sumOffeature = sum(feature[1])
    # O       locate                                        not locate
    # word    feature[1][locate]                            sumOffeature-feature[1][locate]
    # noword  distribute[locate]-feature[1][locate]         sumOfwords-distribute[locate]-sumOffeature+feature[1][locate]
    square = [ [ feature[1][locate], sumOffeature-feature[1][locate] ],[distribute[locate]-feature[1][locate],sumOfwords-distribute[locate]-sumOffeature+feature[1][locate]]]

    # E       locate                                                          not locate
    # word    sumOffeature*distribute[locate]/sumOfwords                      sumOffeature*(sumOfwords-distribute[locate])/sumOfwords
    # noword  (sumOfwords-sumOffeature)*distribute[locate]/sumOfwords         (sumOfwords-sumOffeature)*(sumOfwords-distribute[locate])/sumOfwords
    squareExpect = [[(float)(sumOffeature*distribute[locate]/sumOfwords),(float)(sumOffeature*(sumOfwords-distribute[locate])/sumOfwords)],[(float)((sumOfwords-sumOffeature)*distribute[locate]/sumOfwords),(float)((sumOfwords-sumOffeature)*(sumOfwords-distribute[locate])/sumOfwords)]]

    x = 0
    for i in range(0,2):
        for j in range(0,2):
            if squareExpect[i][j] == 0:
                continue
            x += (float)(pow((square[i][j]-squareExpect[i][j]),2) / (squareExpect[i][j]))
    return x

def stemmedFeature(fin,locations):
    dict = {}
    distribute = [0 for location in locations]
    f = open(fin,'r')

    # Use NLTK corpus to fliter the stopwords
    cachedStopWords = stopwords.words("english")
    for line in f:
        #  the stemmed features via porter2
        features = [stem(re.sub('[^#a-z0-9]','',word.lower())) for word in line.split() if stem(re.sub('[^#a-z0-9]','',word.lower())) not in cachedStopWords]
        # unsteammed features
        # features = [re.sub('[^a-z0-9]','',word.lower()) for word in line.split() if re.sub('[^a-z0-9]','',word.lower()) not in cachedStopWords]
        locate = locations.index(features[-1])
        for feature in features[2:-1]:
            distribute[locate] += 1
            if feature in dict.keys():
                dict[feature][locate] += 1
            else:
                dict[feature] = [ 0 for location in locations]
                dict[feature][locate] = 1
    f.close()
    # writeToFile(locations,distribute,dict,fout)
    writeToFile(locations,distribute,dict,"tweets/stemmed.txt")

def nounFeature(fin,locations):
    dict = {}
    distribute = [0 for location in locations]
    f = open(fin,'r')
    cachedStopWords = stopwords.words("english")
    for line in f:
        bag_of_words = line.split()
        features = [ re.sub('[^#a-z0-9]','',word.lower()) for word, pos in pos_tag(bag_of_words) if (pos == 'NNP' or pos == 'NNPS') and re.sub('[^#a-z0-9]','',word.lower()) not in cachedStopWords]
        locate = locations.index(bag_of_words[-1].lower())
        distribute[locate] += len(bag_of_words)
        for feature in features[2:-1]:
            if feature in dict.keys():
                dict[feature][locate] += 1
            else:
                dict[feature] = [ 0 for location in locations]
                dict[feature][locate] = 1
    f.close()
    writeToFile(locations,distribute,dict,"tweets/nounn.txt",100)


def writeToFile(locations,distribute,dict,fout,limit):
        f = open(fout,'w')
        f.write("\t"+str(distribute)+"\n")
        for locate in range(0,len(locations)):
            f.write("\t"+str(locations[locate])+"\n")
            f.write("----------------------------------------\n")
            termFrequency = {}
            for term in dict.iteritems():
                termFrequency[term[0]] = chi_square(term,distribute,locate)
            for (stop, (key, value)) in zip(xrange(1,limit),sorted(termFrequency.iteritems(), key=lambda (k,v): (v,k), reverse = True)):
                s = str(key) +": "+str(value)+"\n"
                f.write(s)
        f.close()

nounFeature("tweets/train-tweets.txt",['b','h','sd','se','w'])

# stemmedFeature("tweets/train-tweets.txt",['b','h','sd','se','w'])
