import moment from 'moment';

window.now = function(date, onlyDate) {
  if (date === '' || date === false || date === null) {
    date = null;
  } else {
    if (parseInt(date) > 315532800) { // 1980/1/1
        date = parseInt(date);
        if (date < 315532800000) { // convert to millisec
            date *= 1000
        }
    }
    if (!typeof date === "number") {
      if (date.toJSON) {
          date = date.toJSON();
      } else {
          date = date.toString();
      }
      var t = date.split(/[:\-TZ\. ]/);
      for (var i in t) {
          if (t[i] !== '' && isNaN(parseInt(t[i], 10))) return false;
      }
      while (t.length < 7) {
        t.push(0);
      }

      var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5], t[6]);

      date = d.getTime();
    }
  }
  if (onlyDate) {
    return moment(date).utcOffset(-8).format("YYYY-MM-DD");
  }
  return moment(date).utcOffset(-8).format("YYYY-MM-DD-HH-mm-ss-SSS");
};

window.Utils = {
  getDateString: function(time) {
    if (time.toString().indexOf('-') >= 0) {
      return moment(time).utcOffset(-8).format("MM/DD/YYYY");
    } else {
      return new Date(time).toLocaleDateString();
    }
  },
  equals: function(obj1, obj2) {
    var type1 = typeof(obj1);
    var type2 = typeof(obj2);
    if (type1 != type2) {
      return false;
    }
    if (type1 == "number" || type1 == "string" || type1 == "boolean" || type1 == "undefined") {
      return obj1 == obj2;
    }
    if (type1 == "object") {
      if (Object.keys(obj1).length != Object.keys(obj2).length) {
        return false;
      }
      for (let key in obj1) {
        if (!this.equals(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }
    console.log("can't compare:", obj1, obj2);
  }
}

window.GoogleAnalytics = function() {
  if (window.Fbase.isDebug()) {
    return;
  }
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-74582373-1', 'auto');
  ga('require', 'linkid');
  ga('set', 'userId', window.Fbase.authUid); // Set the user ID using signed-in user_id.
  ga('send', 'pageview');
}
