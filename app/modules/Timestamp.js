
import React from 'react';


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


class Timestamp extends React.Component {

    _formatString (string) {
        var formatted = string,
            i,
            regexp;

        for (i in arguments) {
            if (i > 0) {
                regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
                formatted = formatted.replace(regexp, arguments[i]);
            }
        }

        return formatted;
    }


    _plural (string, count, many) {
        if (count == 1) {
            return string;
        } else if (many) {
            return many;
        } else {
            return string + "s";
        }
    }


    _timeAgoInWords (date) {
        var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000),
            ago, future;
        if (seconds < -60 * 60 * 24 * 30 * 12) {
          return this._prettyTime(date);
        } else if (seconds < -60 * 60 * 24 * 30) {
          future = Math.floor(-seconds / (60 * 60 * 24 * 30));
          return this._formatString("In {0} {1}", future, this._plural('month', future));
        } else if (seconds < -60 * 60 * 24 * 7) {
          future = Math.floor(-seconds / (60 * 60 * 24 * 7));
          return this._formatString("In {0} {1}", future, this._plural('week', future));
        } else if (seconds < -60 * 60 * 24) {
          future = Math.floor(-seconds / (60 * 60 * 24));
          return this._formatString("In {0} {1}", future, this._plural('day', future));
        } else if (seconds < 0) {
          return this._formatString("Very soon!");
        } else if (seconds < 60) { // 1 minute
            return "Just then";

        } else if (seconds < 60 * 60) { // 1 hour
            ago = Math.floor(seconds / 60);
            return this._formatString("{0} {1} ago", ago, this._plural('minute', ago));

        } else if (seconds < 60 * 60 * 24) { // 1 day
            ago = Math.floor(seconds / (60 * 60));
            return this._formatString("{0} {1} ago", ago, this._plural('hour', ago));

        } else if (seconds < 60 * 60 * 24 * 7) { // 1 week
            ago = Math.floor(seconds / (60 * 60 * 24));
            return this._formatString("{0} {1} ago", ago, this._plural('day', ago));

        } else if (seconds < 60 * 60 * 24 * 30) { // 1 month
            ago = Math.floor(seconds / (60 * 60 * 24 * 7));
            return this._formatString("{0} {1} ago", ago, this._plural('week', ago));

        } else if (seconds < 60 * 60 * 24 * 30 * 12) { // # 1 year
            ago = Math.floor(seconds / (60 * 60 * 24 * 30));
            return this._formatString("{0} {1} ago", ago, this._plural('month', ago));

        } else {
            return this._prettyTime(date);
        }
    }


    _prettyTime (date) {
        var hours,
            minutes,
            ampm;

        // eg. 5 Nov 12, 1:37pm
        if (date.getHours() % 12 == 0) {
            hours = 12;
        } else {
            hours = date.getHours() % 12;
        }

        if (date.getMinutes() < 10) {
            minutes = '0' + date.getMinutes();
        } else {
            minutes = '' + date.getMinutes();
        }

        if (date.getHours() > 11) {
            ampm = 'pm';
        } else {
            ampm = 'am';
        }

        switch (this.props.format) {
            case 'date':
                return this._formatString("{2}/{1}/{0}",
                    date.getDate(),
                    date.getMonth()+1,
                    date.getFullYear()
                );
            case 'time':
                return this._formatString("{0}:{1}{2}",
                    hours,
                    minutes,
                    ampm
                );
            case 'full':
            default:
              if (hours == 12 && minutes == 0) {
                return this._formatString("{0} {1} {2}",
                    date.getDate(),
                    MONTHS[date.getMonth()],
                    date.getFullYear()
                );
              } else {
                return this._formatString("{0} {1} {2}, {3}:{4}{5}",
                    date.getDate(),
                    MONTHS[date.getMonth()],
                    date.getFullYear(),
                    hours,
                    minutes,
                    ampm
                );
              }
        }
    }


    _parseDate (date) {
        if (date === '' || date === false || date === null) return false;

        if (parseInt(date) > 315532800) { // 1980/1/1
            date = parseInt(date);
            if (date < 315532800000) { // convert to millisec
                date *= 1000
            }
        }
        if (typeof date === "number") {
            date = new Date(date);
            return date;
        }

        if (date.toJSON) {
            date = date.toJSON();
        } else {
            date = date.toString();
        }
        var t = date.split(/[:\-TZ\. ]/);
        for (var i in t) {
            if (t[i] !== '' && isNaN(parseInt(t[i], 10))) return false;
        }
        if (t.length < 6) return false;

        var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5], t[6]);
        // // offset from Pacific
        // d.setTime(d.getTime());
        return d;
    }


    _formatDate (date) {
        var d = this._parseDate(date);

        if (d === false) {
            return 'never';
        }

        if (this.props.format == 'ago') {
            return this._timeAgoInWords(d);
        } else {
            return this._prettyTime(d);
        }
    }


    render () {
        return (
            <span className={this.props.className}>
                {this._formatDate(this.props.time)}
            </span>
        );
    }

}


Timestamp.defaultProps = {
    time: new Date(),
    format: 'ago'
};


Timestamp.propTypes = {
    time: React.PropTypes.any.isRequired,
    format: React.PropTypes.string,
    className: React.PropTypes.any
};


module.exports = Timestamp;
