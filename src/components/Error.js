import React from 'react';
import PropTypes from 'prop-types';

class Error extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {error} = this.props;
        return (
            <div className="alert alert-danger">
                <h4>Error!</h4>
                <p>{error}</p>
            </div>
        );
    }
}

Error.propTypes = {
    error: PropTypes.string
};

export default Error;
