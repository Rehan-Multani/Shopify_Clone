import React from 'react';

/**
 * Isolates section render failures so one bad section never blanks the storefront.
 */
class SectionErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        const { sectionType, sectionId } = this.props;
        console.error(
            `[SectionErrorBoundary] Failed to render section type="${sectionType}" id="${sectionId}"`,
            error,
            info?.componentStack
        );
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.sectionId !== this.props.sectionId
            || prevProps.sectionType !== this.props.sectionType
            || prevProps.resetKey !== this.props.resetKey
        ) {
            if (this.state.hasError) {
                this.setState({ hasError: false, error: null });
            }
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.showFallback) {
                return (
                    <div
                        className="my-4 mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-[11px] font-bold uppercase tracking-wider text-amber-800"
                        role="alert"
                    >
                        Section unavailable{this.props.sectionType ? `: ${this.props.sectionType}` : ''}
                    </div>
                );
            }
            return null;
        }
        return this.props.children;
    }
}

export default SectionErrorBoundary;
