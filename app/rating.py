import json
from datetime import datetime
import sys
import numpy as np
from sklearn import datasets, linear_model

lines = []
users = {}
def loadusers():
  with open('app/ratings/users_03_081.js', 'r') as myfile:
    data=myfile.read().replace('\n', '')

  print "done loading users"
  return json.loads(data)['web']['data']['users']

def loadscores():
  # with open('app/ratings/score_440000_439900.csv', 'r') as myfile:
  with open('app/ratings/score_440000_390000.csv', 'r') as myfile:
  # with open('app/ratings/score_440000_200000.csv', 'r') as myfile:
    l = myfile.read().split('\n')

  print "done loading scores"
  return l

users = loadusers()
lines = loadscores()
params = {
  'weakWin' : 0.06,
  'strongWin' : 0.01,
  'weakGameWin' : 0.01,
  'strongGameWin' : 0.002,
  'weakWinMultiplier' : 2,
  'strongWinMultiplier' : 2.5,
  'winBonus' : 1.1,

  'falseUp' : 0,
  'falseDown' : 0,
  'caughtUp' : 0,
  'missedUp' : 0,
  'caughtDown' : 0,
  'missedDown' : 0,
  'correctStay' : 0,
}
dataset = [1]
def getCurrentRating(uid, date):
  thisYear = getYearEndRating(uid, date.year)
  lastYear = getYearEndRating(uid, date.year - 1)

  users[uid]['currentDate'] = date
  if (thisYear == lastYear):
    users[uid]['currentRating'] = thisYear - 0.25
  else:
    if (lastYear < thisYear):
      users[uid]['currentRating'] = thisYear - 0.4
    else:
      users[uid]['currentRating'] = thisYear - 0.1

def adjustRating(players, matchDate, score, ratingParams):
  if (players[0] == "0" or players[1] == "0"):
    return
  sets = score.split(",")
  scores = []
  setWin = 0
  gameWin = 0
  for s in range(len(sets)):
    set = sets[s].split("-")
    if (set[0] < set[1]):
      setWin-=1
    elif (set[0] > set[1]):
      setWin+=1
    gameWin += int(set[0]) - int(set[1])
    scores.append(set)

  for p in range(len(players)):
    if (not players[p] in users):
      return
    if (users[players[p]]['currentRating'] == 0):
      getCurrentRating(players[p], matchDate)

  currentRatingA = users[players[0]]['currentRating']
  currentRatingB = users[players[1]]['currentRating']
  # print(currentRatingA, currentRatingB)
  if (len(players) > 2):
    currentRatingA = (currentRatingA + users[players[2]]['currentRating']) / 2.0
    currentRatingB = (currentRatingB + users[players[3]]['currentRating']) / 2.0

  newRatingA = currentRatingA
  newRatingB = currentRatingB
  weakWinFactor = 1 + params['weakWinMultiplier'] * abs(currentRatingB - currentRatingA)
  strongWinFactor = max(0, 1 - strongWinMultiplier * abs(currentRatingB - currentRatingA))
  # console.log(weakWinFactor, strongWinFactor)
  if (currentRatingA < currentRatingB):
    if (setWin > 0):
      newRatingA += winBonus * weakWinFactor * weakWin
      newRatingB -= weakWinFactor * weakWin
    elif (setWin < 0):
      newRatingA -= strongWinFactor * strongWin
      newRatingB += winBonus * strongWinFactor * strongWin

    if (gameWin > 0):
      newRatingA += winBonus * weakWinFactor * gameWin * weakGameWin
      newRatingB -= weakWinFactor * gameWin * weakGameWin
    elif (gameWin < 0):
      newRatingA -= strongWinFactor * gameWin * strongGameWin
      newRatingB += winBonus * strongWinFactor * gameWin * strongGameWin

  else:
    if (setWin > 0):
      newRatingA += winBonus * strongWinFactor * strongWin
      newRatingB -= strongWinFactor * strongWin
    elif (setWin < 0):
      newRatingA -= weakWinFactor * weakWin
      newRatingB += winBonus * weakWinFactor * weakWin

    if (gameWin > 0):
      newRatingA += winBonus * strongWinFactor * gameWin * strongGameWin
      newRatingB -= strongWinFactor * gameWin * strongGameWin
    elif (gameWin < 0):
      newRatingA -= weakWinFactor * gameWin * weakGameWin
      newRatingB += winBonus * weakWinFactor * gameWin * weakGameWin

  if (len(players) > 2):
    users[players[0]]['currentRating'] += (newRatingA - currentRatingA) / 2
    users[players[1]]['currentRating'] += (newRatingB - currentRatingB) / 2
    users[players[2]]['currentRating'] += (newRatingA - currentRatingA) / 2
    users[players[3]]['currentRating'] += (newRatingB - currentRatingB) / 2
  else:
    users[players[0]]['currentRating'] = newRatingA
    users[players[1]]['currentRating'] = newRatingB

  # print(players, scores, currentRatingA, newRatingA, currentRatingB, newRatingB)

  verifyRating(players, matchDate)
  for p in range(len(players)):
    # if (players[p] == "n:42027"):
    #   console.log(scores, players,currentRatingA, newRatingA, currentRatingB, newRatingB, users[players[p]].ratings)
    # }
    users[players[p]]['currentDate'] = matchDate
    if (not 'ratings' in users[players[p]]):
      users[players[p]]['ratings'] = []

    users[players[p]]['ratings'].append({'r':users[players[p]]['currentRating'], 'd':matchDate})

def getRatingFromString(ratingString):
  try:
    if (type(ratingString) is 'float'):
      return ratingString
    if len(ratingString) < 3 or ratingString[1:2] != '.':
      return 3.25
    return float(ratingString)
  except:
    return 3.25

def getYearEndRating(uid, year):
  if (not 'teams' in users[uid]):
    if ('r' in users[uid]):
      return getRatingFromString(users[uid]['r'])
    return getRatingFromString("")

  teams = users[uid]['teams'].keys()
  teams = list(map((lambda x: int(x)), teams))
  teams.sort()

  for t in reversed(range(len(teams))):
    if (datetime.strptime(users[uid]['teams'][str(teams[t])]['d'], '%m/%d/%y').year <= year):
      if (t < len(teams) - 1):
        return getRatingFromString(users[uid]['teams'][str(teams[t + 1])]['r'][:3])
      else:
        return getRatingFromString(users[uid]['teams'][str(teams[t])]['r'][:3])

  if (len(teams) > 0):
    return getRatingFromString(users[uid]['teams'][str(teams[0])]['r'][:3])

  return 0

def verifyRating(players, matchDate):
  for p in range(len(players)):
    if (matchDate.year != users[players[p]]['currentDate'].year):
      r = getYearEndRating(players[p], users[players[p]]['currentDate'].year)
      l = getYearEndRating(players[p], users[players[p]]['currentDate'].year - 1)

      if (r < users[players[p]]['currentRating'] or r - 0.5 > users[players[p]]['currentRating']):
        if (r > l):
          print(matchDate, users[players[p]]['currentDate'], players[p], r, l, users[players[p]]['currentRating'])
          params['missedUp'] += 1
        elif (r < l):
          params['missedDown'] += 1
        else:
          if (users[players[p]]['currentRating'] > r):
            params['falseUp'] += 1
          else:
            params['falseDown'] += 1

        a = (r-0.49)/users[players[p]]['currentRating']
        if (r < users[players[p]]['currentRating']):
          a = (r+0.01)/users[players[p]]['currentRating']

        if (users[players[p]]['ratings']):
          for i in range(len(users[players[p]]['ratings'])):
            users[players[p]]['ratings'][i]['r'] = users[players[p]]['ratings'][i]['r'] * a

        # if (players[p] == "n:42027"):
        #   console.log(r, l, users[players[p]]['currentRating'], matchDate)
        # }
        # print(r, users[players[p]]['currentRating'], a, matchDate, users[players[p]]['currentRating']*a, users[players[p]])
        users[players[p]]['currentRating'] *= a #2 * users[players[p]]['currentRating'] / a - users[players[p]]['currentRating'] / a / a
      else:
        if (r > l):
          params['caughtUp'] += 1
        elif (r < l):
          params['caughtDown'] += 1
        else:
          params['correctStay'] += 1

def printRatings():
  print("swm",params['strongWinMultiplier'],"wwm", params['weakWinMultiplier'], (params['falseUp'] + params['falseDown'])/float(params['correctStay']), params['falseUp'], params['falseDown'], params['correctStay'],
    "Up", params['missedUp']/float(params['missedUp'] + params['caughtUp']), params['missedUp'], params['caughtUp'], "Down", params['missedDown']/float(params['missedDown'] + params['caughtDown']), params['missedDown'], params['caughtDown'])

def calculate():
  for i in users:
    users[i]['currentRating'] = 0

  for i in reversed(range(len(lines))):
    if (i % 100000 == 0):
      print i
      # console.log(i)
    if (not lines[i]):
      continue
    fields = lines[i].split(";")
    if (len(fields) < 6):
      continue
    # console.log(fields)
    matchDate = fields[6]
    scores = fields[4]
    players = fields[5].split(",")
    if (len(players) < 2 or players[0] == "0" or players[1] == "0"):
      continue
    for p in range(len(players)):
      players[p] = "n:"+ str(players[p])

    adjustRating(players, datetime.strptime(matchDate, '%m/%d/%y'), scores, ratingParams)

  printRatings()

calculate()

clf = linear_model.LinearRegression()

