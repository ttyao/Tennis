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
  # with open('app/ratings/score_447000_1.csv', 'r') as myfile:
    l = myfile.read().split('\n')

  print "done loading scores"
  return l

users = loadusers()
cities = {}
keys = users.keys()
for i in range(len(keys)):
  if ('residence' in users[keys[i]]):
    if (not users[keys[i]]['residence'] in cities):
      cities[users[keys[i]]['residence']] = 1
    else:
      cities[users[keys[i]]['residence']] += 1

print(cities)
lines = loadscores()

# coef = [ 0.84558116, 0.15436418, 0.0059048, -0.00579683, 0.00571815, -0.00560179, 0.04096807, -0.04006691]
# coef = [ 0.89871726,  0.10126063,  0.00368376, -0.00362804,  0.00359264,
#      -0.00353437,  0.02424932, -0.02374288]
# coef = [ 0.93322825,  0.06676375,  0.00229949, -0.00227092,  0.00225714,
#      -0.00222839,  0.01435732, -0.01407215]
# coef = [ 0.95665398,  0.04334695,  0.00144281, -0.00142818,  0.00142577,
#      -0.00141159,  0.008529  , -0.00836636]
coef = [0.86517004,  0.13469988,  0.00621096, -0.00618761,  0.00606525, -0.00601704,
  0.03712186, -0.03667191]

def getCurrentRating(uid, date):
  thisYear = getYearEndRating(uid, date.year - 1)
  lastYear = getYearEndRating(uid, date.year - 2)

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
  # print(currentRatingA, currentRatingB)
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

  # newRatingA = coef[0] * currentRatingA + coef[1] * currentRatingB + coef[2] * int(s[0]) + coef[3] * int(s[1]) + coef[4] * int(s[2]) + coef[5] * int(s[3]) + coef[6] * int(s[4]) + coef[7] * int(s[5])
  # newRatingB = coef[0] * currentRatingB + coef[1] * currentRatingA + coef[2] * int(s[1]) + coef[3] * int(s[0]) + coef[4] * int(s[3]) + coef[5] * int(s[2]) + coef[6] * int(s[5]) + coef[7] * int(s[4])

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
  verifyRating(players, matchDate)
  for p in range(len(players)):
    # if (players[p] == "n:42027"):
    #   console.log(scores, players,currentRatingA, newRatingA, currentRatingB, newRatingB, users[players[p]].ratings)
    # }
    users[players[p]]['currentDate'] = matchDate
    if (not 'ratings' in users[players[p]]):
      users[players[p]]['ratings'] = []
    users[players[p]]['ratings'].append({'d': matchDate, 'r':users[players[p]]['currentRating']})

  # users[players[1]]['ratings'].append({'d': matchDate, 'oldA' : currentRatingB, 'oldB': currentRatingA, "scores":[s[1],s[0],s[3],s[2],s[5],s[4]], 'r':(users[players[1]]['currentRating'] + users[players[3]]['currentRating'])/2})
  if (len(players) > 2):
    dataset.append([currentRatingA, currentRatingB]+s)
    result.append((users[players[0]]['currentRating'] + users[players[2]]['currentRating'])/2)
    dataset.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
    result.append((users[players[1]]['currentRating'] + users[players[3]]['currentRating'])/2)
  else:
    dataset.append([currentRatingA, currentRatingB]+s)
    result.append(users[players[0]]['currentRating'])
    dataset.append([currentRatingB, currentRatingA]+ [s[1],s[0],s[3],s[2],s[5],s[4]])
    result.append(users[players[1]]['currentRating'])

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
          # print(matchDate, users[players[p]]['currentDate'], players[p], r, l, users[players[p]]['currentRating'])
          params['missedUp'] += 1
        elif (r < l):
          params['missedDown'] += 1
        else:
          if (users[players[p]]['currentRating'] > r):
            params['falseUp'] += 1
          else:
            params['falseDown'] += 1

        a = ((r-0.4)+users[players[p]]['currentRating'])/2/users[players[p]]['currentRating']
        if (r < users[players[p]]['currentRating']):
          a = ((r+0.1)+users[players[p]]['currentRating'])/2/users[players[p]]['currentRating']

        if ('ratings' in users[players[p]]):
          for i in range(len(users[players[p]]['ratings'])):
            users[players[p]]['ratings'][i]['r'] = users[players[p]]['ratings'][i]['r'] * a

        # if (players[p] == "n:42027"):
        #   console.log(r, l, users[players[p]]['currentRating'], matchDate)
        # }
        # print(r, users[players[p]]['currentRating'], a, users[players[p]]['currentRating']*a)
        users[players[p]]['currentRating'] *= a #2 * users[players[p]]['currentRating'] / a - users[players[p]]['currentRating'] / a / a
      else:
        if (r > l):
          params['caughtUp'] += 1
          # print(l, r, users[players[p]]['currentRating'], players[p])
        elif (r < l):
          params['caughtDown'] += 1
        else:
          params['correctStay'] += 1

def printRatings():
  print("swm",params['strongWinMultiplier'],"wwm", params['weakWinMultiplier'], (params['falseUp'] + params['falseDown'])/float(params['correctStay']), params['falseUp'], params['falseDown'], params['correctStay'],
    "Up", params['missedUp']/float(params['missedUp'] + params['caughtUp']), params['missedUp'], params['caughtUp'], "Down", params['missedDown']/float(params['missedDown'] + params['caughtDown']), params['missedDown'], params['caughtDown'])

def calculate():
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

for i in range(3):
  print(coef)
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
  calculate()
# userIds = users.keys()
# for i in range(len(userIds)):
#   user = users[userIds[i]]
#   if ('ratings' in user):
#     for j in range(len(user['ratings'])):
#       dataset.append([user['ratings'][j]['oldA'],user['ratings'][j]['oldB']]+user['ratings'][j]['scores'])
#       result.append(user['ratings'][j]['r'])

  clf = linear_model.LinearRegression()
  clf.fit(dataset, result)
  coef=clf.coef_
