export function setTool(step, tool) {
    return {
        type: 'SET_TOOL',
        step,
        tool
    };
}

export function setZoomValue(step, zoomValue) {
    return {
        type: 'SET_ZOOM_VALUE',
        step,
        zoomValue
    };
}

export function setZoomPercentage(step, zoomValue, zoomPercentage) {
    return {
        type: 'SET_ZOOM_PERCENTAGE',
        step,
        zoomValue,
        zoomPercentage
    };
}

export function setError(step, error) {
    return {
        type: 'SET_ERROR',
        step,
        error
    };
}

export function clearError(step) {
    return {
        type: 'CLEAR_ERROR',
        step
    };
}

export function applyRotation(step, delta) {
    return {
        type: 'APPLY_ROTATION',
        step,
        delta
    }
}
