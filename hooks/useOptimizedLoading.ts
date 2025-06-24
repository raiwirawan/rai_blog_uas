"use client";

import { useState, useEffect, useCallback } from "react";

interface UseOptimizedLoadingOptions {
	delay?: number;
	minDuration?: number;
}

export function useOptimizedLoading(options: UseOptimizedLoadingOptions = {}) {
	const { delay = 100, minDuration = 300 } = options;
	const [isLoading, setIsLoading] = useState(false);
	const [shouldShow, setShouldShow] = useState(false);

	const startLoading = useCallback(() => {
		setIsLoading(true);
		setShouldShow(false);
	}, []);

	const stopLoading = useCallback(() => {
		setIsLoading(false);
	}, []);

	useEffect(() => {
		let delayTimer: NodeJS.Timeout;
		let minDurationTimer: NodeJS.Timeout;

		if (isLoading) {
			// Delay showing loading state to avoid flickering
			delayTimer = setTimeout(() => {
				setShouldShow(true);
			}, delay);

			// Ensure minimum loading duration
			minDurationTimer = setTimeout(() => {
				if (!isLoading) {
					setShouldShow(false);
				}
			}, minDuration);
		} else {
			setShouldShow(false);
		}

		return () => {
			clearTimeout(delayTimer);
			clearTimeout(minDurationTimer);
		};
	}, [isLoading, delay, minDuration]);

	return {
		isLoading,
		shouldShow: shouldShow && isLoading,
		startLoading,
		stopLoading,
	};
}
