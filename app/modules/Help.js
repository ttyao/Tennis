import React from 'react';

export default class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: props.notice};
  }

  render() {
    return(
      <div style={{margin: '10px'}}>
        Tennis Database is an online website to store tennis ladder and league player stats.
        It collects each individual player's match records and use machine learning algorithm to calculate dynamic based these records.
        <br/>
        <br/>
        Currently Tennis database imports data from USTA northern California section, so that all the past match results can be found in the system. If you are a registered USTA player in northern California, you can enter your USTA number to have your account connected with your USTA data.
        <br/>
        <br/>
        If you want to setup a new ladder for your team or if you have any question or comments, please send email to <a href="mailto:admin@tennis-db.com">admin@tennis-db.com</a>
        <br/>
        <br/>Enjoy tennis!
      </div>
    );
  }
}

Help.defaultProps = { frictionConfig: {} };
