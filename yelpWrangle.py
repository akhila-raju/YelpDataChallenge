import ujson as json
import csv
import io
import pickle
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt

###### LOADING JSONS ######

def loadFile(f): 
#loads a file and decodes it
#assumes 1 json object per line
#f is the last word of the file for ease
	out = []
	with open('yelp_academic_dataset_'+f+'.json', 'rU') as f:
		for line in f:
			out.append(json.loads(line))
	return out

def head(f, n):
#same as loadFile but just the first n lines
#for testing purposes, since the review file is >1GB
	out = []
	i = 0
	with open('yelp_academic_dataset_'+f+'.json', 'rU') as f:
		for line in f:
			out.append(json.loads(line))
			i += 1
			if i >= n:
				return out

####### ARRANGING AND SORTING ELEMENTS######

def byBiz(a):
#takes a list of reviews and turns it into a dict
#keys are unique business IDs and 
#values are a list of reviews for each business
	out = {}
	bizIDs = set([x['business_id'] for x in a])
	for ID in bizIDs:
		out[ID] = [x for x in a if x['business_id'] == ID]
	return out

def byVar(d, var):
#takes a dict of reviews by IDs and sorts the reviews by some value
	if var in ['funny', 'useful', 'cool']:
		for k in d.keys():
			#lists of dicts can be sorted!
			d[k] = sorted(d[k], key=lambda p: p['votes'][var])
	return d

###### WRITING OUT TO JSON ######

def writeOut(d, f):
	with open(f, 'w') as f:
		json.dump(d, f)


"""bizData = loadFile('business')
reviewData = head('review', 1000) 
out = byVar(byBiz(reviewData), 'useful')
writeOut(out, 'testArr.json')"""
def test():
	bizData = loadFile('business')
	bizData = [x for x in bizData if x['city'] == 'Madison']
	byReviewCount = sorted(bizData, key=lambda x: x['review_count'])
	reviewCounts = [x['review_count'] for x in byReviewCount[::-1]]
	#plt.hist(reviewCounts)
	#plt.show
	writeOut(bizData, 'biz.json')








