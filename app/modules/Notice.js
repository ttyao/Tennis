import React from 'react';

export default class Notice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: props.notice};
  }

  render() {
    return(
      <div>
        {this.state.message}
      </div>
    );
  }
}

Notice.defaultProps = { frictionConfig: {} };
