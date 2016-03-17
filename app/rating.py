import json
from datetime import datetime
import sys
import numpy as np
from sklearn import datasets, linear_model
import copy

def loadusers():
  with open('ratings/users_03_081.js', 'r') as myfile:
  # with open('app/ratings/users_output.js', 'r') as myfile:
    data=myfile.read().replace('\n', '')

  print "done loading users"
  return json.loads(data)['web']['data']['users']

def loadratings():
  with open('ratings/users_output1.js', 'r') as myfile:
    data=myfile.read().replace('\n', '')

  return json.loads(data)

def saveratings():
  with open('ratings/users_output1.js', 'w') as myfile:
    json.dump(yr, myfile)

def loadscores():
  # with open('app/ratings/score_440000_439900.csv', 'r') as myfile:
  # with open('ratings/score_440000_390000.csv', 'r') as myfile:
  with open('ratings/score_98_01.csv', 'r') as myfile:
  # with open('ratings/score_440000_200000.csv', 'r') as myfile:
  # with open('app/ratings/score_447000_1.csv', 'r') as myfile:
    l = myfile.read().split('\n')

  print "done loading scores"
  return l

users = loadusers()
lines = loadscores()

coef = [ 0.92939167,  0.07098175,  0.00370407, -0.00357693,  0.00363907, -0.0034502,
  0.02434353 ,-0.02373722]
coef1 = [ 0.92227104 , 0.07804365,  0.00359536 ,-0.00350522,  0.00354376 ,-0.00340536,
  0.02407009 ,-0.02350451]
def getCurrentRating(uid, date):
  thisYear = getYearEndRating(uid, date.year - 1)
  lastYear = getYearEndRating(uid, date.year - 2)

  users[uid]['currentYear'] = date.year
  if (thisYear == lastYear):
    users[uid]['currentRating'] = thisYear - 0.25
  else:
    if (lastYear < thisYear):
      users[uid]['currentRating'] = thisYear - 0.4
    else:
      users[uid]['currentRating'] = thisYear - 0.1

def adjustRating(players, matchDate, score):
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

  s = list(map((lambda x: int(x)), score.replace(",","-").split("-")))
  if (len(s) == 4):
    s = s+[0,0]
  if (len(s) < 6):
    return

  for p in range(len(players)):
    if (not players[p] in users):
      return
    if (users[players[p]]['currentRating'] == 0):
      getCurrentRating(players[p], matchDate)

  currentRatingA = users[players[0]]['currentRating']
  currentRatingB = users[players[1]]['currentRating']

  if (len(players) > 2):
    currentRatingA = (currentRatingA + users[players[2]]['currentRating']) / 2.0
    currentRatingB = (currentRatingB + users[players[3]]['currentRating']) / 2.0

  newRatingA = currentRatingA
  newRatingB = currentRatingB
  weakWinFactor = 1 + params['weakWinMultiplier'] * abs(currentRatingB - currentRatingA)
  strongWinFactor = max(0, 1 - params['strongWinMultiplier'] * abs(currentRatingB - currentRatingA))
  # console.log(weakWinFactor, strongWinFactor)
  if (currentRatingA < currentRatingB):
    if (setWin > 0):
      newRatingA += params['winBonus'] * weakWinFactor * params['weakWin']
      newRatingB -= weakWinFactor * params['weakWin']
    elif (setWin < 0):
      newRatingA -= strongWinFactor * params['strongWin']
      newRatingB += params['winBonus'] * strongWinFactor * params['strongWin']

    if (gameWin > 0):
      newRatingA += params['winBonus'] * weakWinFactor * gameWin * params['weakGameWin']
      newRatingB -= weakWinFactor * gameWin * params['weakGameWin']
    elif (gameWin < 0):
      newRatingA -= strongWinFactor * gameWin * params['strongGameWin']
      newRatingB += params['winBonus'] * strongWinFactor * gameWin * params['strongGameWin']

  else:
    if (setWin > 0):
      newRatingA += params['winBonus'] * strongWinFactor * params['strongWin']
      newRatingB -= strongWinFactor * params['strongWin']
    elif (setWin < 0):
      newRatingA -= weakWinFactor * params['weakWin']
      newRatingB += params['winBonus'] * weakWinFactor * params['weakWin']

    if (gameWin > 0):
      newRatingA += params['winBonus'] * strongWinFactor * gameWin * params['strongGameWin']
      newRatingB -= strongWinFactor * gameWin * params['strongGameWin']
    elif (gameWin < 0):
      newRatingA -= weakWinFactor * gameWin * params['weakGameWin']
      newRatingB += params['winBonus'] * weakWinFactor * gameWin * params['weakGameWin']

  if (currentRatingA > currentRatingB):
    newRatingA = coef[0] * currentRatingA + coef[1] * currentRatingB + coef[2] * int(s[0]) + coef[3] * int(s[1]) + coef[4] * int(s[2]) + coef[5] * int(s[3]) + coef[6] * int(s[4]) + coef[7] * int(s[5])
    newRatingB = coef[0] * currentRatingB + coef[1] * currentRatingA + coef[2] * int(s[1]) + coef[3] * int(s[0]) + coef[4] * int(s[3]) + coef[5] * int(s[2]) + coef[6] * int(s[5]) + coef[7] * int(s[4])
  else:
    newRatingA = coef1[0] * currentRatingA + coef1[1] * currentRatingB + coef1[2] * int(s[0]) + coef1[3] * int(s[1]) + coef1[4] * int(s[2]) + coef1[5] * int(s[3]) + coef1[6] * int(s[4]) + coef1[7] * int(s[5])
    newRatingB = coef1[0] * currentRatingB + coef1[1] * currentRatingA + coef1[2] * int(s[1]) + coef1[3] * int(s[0]) + coef1[4] * int(s[3]) + coef1[5] * int(s[2]) + coef1[6] * int(s[5]) + coef1[7] * int(s[4])

  if (len(players) > 2):
    users[players[0]]['currentRating'] += (newRatingA - currentRatingA) / 2
    users[players[1]]['currentRating'] += (newRatingB - currentRatingB) / 2
    users[players[2]]['currentRating'] += (newRatingA - currentRatingA) / 2
    users[players[3]]['currentRating'] += (newRatingB - currentRatingB) / 2
  else:
    users[players[0]]['currentRating'] = newRatingA
    users[players[1]]['currentRating'] = newRatingB

  # print(players, scores, currentRatingA, newRatingA, currentRatingB, newRatingB)

  # dataset.append([currentRatingA, currentRatingB] + s)
  # result.append(newRatingA)
  # dataset.append([currentRatingB, currentRatingA, s[1], s[0], s[3], s[2], s[5], s[4]])
  # result.append(newRatingB)
  for p in range(len(players)):

    if (not 'ratings' in users[players[p]]):
      users[players[p]]['ratings'] = []
    if (p % 2 == 0):
      users[players[p]]['ratings'].append({
        'r':users[players[p]]['currentRating'],
        'old':currentRatingA,
        'opp':currentRatingB,
        'new':newRatingA,
        's':s
      })
    else:
      users[players[p]]['ratings'].append({
        'r':users[players[p]]['currentRating'],
        'old':currentRatingB,
        'opp':currentRatingA,
        'new':newRatingB,
        's':[s[1],s[0],s[3],s[2],s[5],s[4]]
      })
  verifyRating(players, matchDate, year)
  for p in range(len(players)):
    users[players[p]]['currentYear'] = matchDate.year

  # users[players[1]]['ratings'].append({'d': matchDate, 'oldA' : currentRatingB, 'oldB': currentRatingA, "scores":[s[1],s[0],s[3],s[2],s[5],s[4]], 'r':(users[players[1]]['currentRating'] + users[players[3]]['currentRating'])/2})
  # if (len(players) > 2):
  #   if (currentRatingA > currentRatingB):
  #     dataset.append([currentRatingA, currentRatingB]+s)
  #     result.append((users[players[0]]['currentRating'] + users[players[2]]['currentRating'])/2)
  #     dataset.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
  #     result.append((users[players[1]]['currentRating'] + users[players[3]]['currentRating'])/2)
  #   else:
  #     dataset1.append([currentRatingA, currentRatingB]+s)
  #     result1.append((users[players[0]]['currentRating'] + users[players[2]]['currentRating'])/2)
  #     dataset1.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
  #     result1.append((users[players[1]]['currentRating'] + users[players[3]]['currentRating'])/2)
  # else:
  #   if (currentRatingA > currentRatingB):
  #     dataset.append([currentRatingA, currentRatingB]+s)
  #     result.append(users[players[0]]['currentRating'])
  #     dataset.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
  #     result.append(users[players[1]]['currentRating'])
  #   else:
  #     dataset1.append([currentRatingA, currentRatingB]+s)
  #     result1.append(users[players[0]]['currentRating'])
  #     dataset1.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
  #     result1.append(users[players[1]]['currentRating'])

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
  if (year in lastRatings and uid in lastRatings[year]):
    return lastRatings[year][uid]['c']

  if (not 'teams' in users[uid]):
    if ('r' in users[uid]):
      return getRatingFromString(users[uid]['r'])
    return getRatingFromString("")

  teams = users[uid]['teams'].keys()
  teams = list(map((lambda x: int(x)), teams))
  teams.sort()

  rating = 0
  for t in reversed(range(len(teams))):
    if (datetime.strptime(users[uid]['teams'][str(teams[t])]['d'], '%m/%d/%y').year <= year):
      if (t < len(teams) - 1):
        rating = getRatingFromString(users[uid]['teams'][str(teams[t + 1])]['r'][:3])
      else:
        rating = getRatingFromString(users[uid]['teams'][str(teams[t])]['r'][:3])

  if (len(teams) > 0):
    rating = getRatingFromString(users[uid]['teams'][str(teams[0])]['r'][:3])

  if (rating > 0):
    return rating
  if (year < 2016):
    return getYearEndRating(uid, year+1)
  return 3.25

def verifyRating(players, matchDate, year):
  for p in range(len(players)):
    if (matchDate.year > users[players[p]]['currentYear']):
      r = getYearEndRating(players[p], users[players[p]]['currentYear'])
      l = getYearEndRating(players[p], users[players[p]]['currentYear'] - 1)

      if (players[p] in yr[users[players[p]]['currentYear']]):
        continue

      if (r < users[players[p]]['currentRating'] or r - 0.5 > users[players[p]]['currentRating']):
        if (players[p] in yr[year]):
          if (players[p] in found):
            continue
          found[players[p]] = True
        a = ((r-0.45)+users[players[p]]['currentRating'])/2/users[players[p]]['currentRating']
        if (r < users[players[p]]['currentRating']):
          a = ((r-0.05)+users[players[p]]['currentRating'])/2/users[players[p]]['currentRating']

        tmp = 0
        tmp1 = 0
        if ('ratings' in users[players[p]]):
          tmp = users[players[p]]['ratings'][0]['r']
          for i in range(len(users[players[p]]['ratings'])):
            users[players[p]]['ratings'][i]['r'] = users[players[p]]['ratings'][i]['r'] * a
            users[players[p]]['ratings'][i]['old'] = users[players[p]]['ratings'][i]['old'] * a
            users[players[p]]['ratings'][i]['new'] = users[players[p]]['ratings'][i]['new'] * a
          tmp1 = users[players[p]]['ratings'][0]['r']

        if (users[players[p]]['currentYear'] == year):
          if (r > l):
            params['missedUp'] += 1
          elif (r < l):
            params['missedDown'] += 1

          if (users[players[p]]['currentRating'] > r):
            params['falseUp'] += 1
          else:
            print(players[p], l, r, users[players[p]]['currentRating'], a, users[players[p]]['currentRating']*a, tmp, tmp1, users[players[p]]['currentYear'], matchDate)
            params['falseDown'] += 1

        # print(players[p], l, r, users[players[p]]['currentRating'], a, users[players[p]]['currentRating']*a, tmp, tmp1, users[players[p]]['currentYear'], matchDate)
        users[players[p]]['currentRating'] *= a #2 * users[players[p]]['currentRating'] / a - users[players[p]]['currentRating'] / a / a
      else:
        if (users[players[p]]['currentYear'] == year):
          if (r > l):
            params['caughtUp'] += 1
          elif (r < l):
            params['caughtDown'] += 1
          params['correctStay'] += 1

      yr[users[players[p]]['currentYear']][players[p]] = {"c":users[players[p]]['currentRating'], "r":r, "l":l}

def printRatings():
  print(#(params['falseUp'] + params['falseDown'])/float(params['correctStay']),
        params['falseUp'], params['falseDown'], params['correctStay'],
        "Up", #params['missedUp']/float(params['missedUp'] + params['caughtUp']),
        params['missedUp'], params['caughtUp'],
        "Down", #params['missedDown']/float(params['missedDown'] + params['caughtDown']),
        params['missedDown'], params['caughtDown'])

def calculate(year):
  for i in users:
    if ('ratings' in users[i]):
      users[i]['currentRating'] = users[i]['ratings'][0]['r']
    else:
      users[i]['currentRating'] = 0

  for i in reversed(range(len(lines))):
    # if (i % 100000 == 0):
    #   print i
      # console.log(i)
    if (not lines[i]):
      continue
    fields = lines[i].split(";")
    if (len(fields) < 6):
      continue
    matchDate = fields[6]
    scores = fields[4]
    players = fields[5].split(",")
    if (len(players) < 2 or players[0] == "0" or players[1] == "0"):
      continue
    for p in range(len(players)):
      players[p] = "n:"+ str(players[p])

    adjustRating(players, datetime.strptime(matchDate, '%m/%d/%y'), scores)

  printRatings()

print(coef)
  # yr = loadratings()

yr = {}
for i in range(7):
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
  dataset = []
  result = []
  dataset1 = []
  result1 = []
  found = {}
  lastRatings = copy.deepcopy(yr)
  yr = {}
  for r in range(20):
    yr[r+1998] = {}

  year = 1999
  calculate(year)
  userIds = users.keys()
  for i in range(len(userIds)):
    user = users[userIds[i]]
    if ('ratings' in user):
      for j in range(len(user['ratings'])):
        if (user['ratings'][j]['old'] > user['ratings'][j]['opp']):
          dataset.append([user['ratings'][j]['old'],user['ratings'][j]['opp']]+user['ratings'][j]['s'])
          result.append(user['ratings'][j]['new'])
        else:
          dataset1.append([user['ratings'][j]['old'],user['ratings'][j]['opp']]+user['ratings'][j]['s'])
          result1.append(user['ratings'][j]['new'])

  clf = linear_model.LinearRegression()
  clf.fit(dataset, result)
  # coef=clf.coef_
  print(clf.coef_)
  clf = linear_model.LinearRegression()
  clf.fit(dataset1, result1)
  # coef=clf.coef_
  print(clf.coef_)
  print(len(yr))
  saveratings()
