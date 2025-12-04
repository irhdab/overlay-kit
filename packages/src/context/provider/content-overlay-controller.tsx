import { type FC, type ActionDispatch, memo, useEffect } from 'react';
import { type OverlayReducerAction } from '../reducer';

/**
 * Props passed to overlay controller components
 * @property overlayId - Unique identifier for this overlay instance
 * @property isOpen - Current open state of the overlay
 * @property close - Function to close the overlay (triggers exit animation)
 * @property unmount - Function to completely remove overlay from DOM
 */
export type OverlayControllerProps = {
  overlayId: string;
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
};

/**
 * Props passed to async overlay controller components
 * @template T - The type of the value returned when the overlay is closed
 * @property close - Function to close the overlay with a resolved value
 * @property reject - Function to close the overlay with a rejected reason
 */
export type OverlayAsyncControllerProps<T> = Omit<OverlayControllerProps, 'close'> & {
  close: (param: T) => void;
  reject: (reason?: unknown) => void;
};

export type OverlayControllerComponent = FC<OverlayControllerProps>;
export type OverlayAsyncControllerComponent<T> = FC<OverlayAsyncControllerProps<T>>;

type ContentOverlayControllerProps = {
  isOpen: boolean;
  overlayId: string;
  overlayDispatch: ActionDispatch<[action: OverlayReducerAction]>;
  controller: OverlayControllerComponent;
};

export const ContentOverlayController = memo(
  ({ isOpen, overlayId, overlayDispatch, controller: Controller }: ContentOverlayControllerProps) => {
    useEffect(() => {
      /**
       * Use requestAnimationFrame to ensure the overlay is mounted in the next frame
       * This prevents potential race conditions and ensures smooth animations
       * by synchronizing with the browser's paint cycle
       */
      requestAnimationFrame(() => {
        overlayDispatch({ type: 'OPEN', overlayId });
      });
    }, [overlayDispatch, overlayId]);

    return (
      <Controller
        isOpen={isOpen}
        overlayId={overlayId}
        close={() => overlayDispatch({ type: 'CLOSE', overlayId })}
        unmount={() => overlayDispatch({ type: 'REMOVE', overlayId })}
      />
    );
  }
);
