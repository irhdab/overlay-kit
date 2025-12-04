import {
  type OverlayAsyncControllerProps,
  type OverlayAsyncControllerComponent,
  type OverlayControllerComponent,
} from './context/provider/content-overlay-controller';
import { createUseExternalEvents } from './utils';
import { randomId } from './utils/random-id';

export type OverlayEvent = {
  open: (args: { controller: OverlayControllerComponent; overlayId: string; componentKey: string }) => void;
  close: (overlayId: string) => void;
  unmount: (overlayId: string) => void;
  closeAll: () => void;
  unmountAll: () => void;
};

type OpenOverlayOptions = {
  overlayId?: string;
};

/**
 * Creates an overlay context with event emitter
 * @param overlayId - Unique identifier for the overlay scope
 * @returns Overlay control methods and hooks
 * @example
 * const overlay = createOverlay('my-app');
 * overlay.open(({ isOpen, close }) => <Dialog open={isOpen} onClose={close} />);
 */
export function createOverlay(overlayId: string) {
  const [useOverlayEvent, createEvent] = createUseExternalEvents<OverlayEvent>(`${overlayId}/overlay-kit`);

  /**
   * Opens an overlay with the given controller component
   * @param controller - React component that controls the overlay
   * @param options - Optional configuration including overlayId
   * @returns The ID of the opened overlay
   */
  const open = (controller: OverlayControllerComponent, options?: OpenOverlayOptions) => {
    const overlayId = options?.overlayId ?? randomId();
    const componentKey = randomId();
    const dispatchOpenEvent = createEvent('open');

    dispatchOpenEvent({ controller, overlayId, componentKey });
    return overlayId;
  };

  /**
   * Opens an overlay and returns a Promise that resolves with the overlay result
   * @template T - The type of the value returned when the overlay is closed
   * @param controller - React component that controls the overlay with async result
   * @param options - Optional configuration including overlayId
   * @returns Promise that resolves when the overlay is closed with a value
   * @example
   * const result = await overlay.openAsync<boolean>(({ isOpen, close }) => (
   *   <Dialog open={isOpen} onConfirm={() => close(true)} />
   * ));
   */
  const openAsync = async <T>(controller: OverlayAsyncControllerComponent<T>, options?: OpenOverlayOptions) => {
    return new Promise<T>((_resolve, _reject) => {
      open((overlayProps, ...deprecatedLegacyContext) => {
        /**
         * @description close the overlay with resolve
         */
        const close = (param: T) => {
          _resolve(param);
          overlayProps.close();
        };

        /**
         * @description close the overlay with reject
         */
        const reject = (reason?: unknown) => {
          _reject(reason);
          overlayProps.close();
        };

        /**
         * @description Passing overridden methods
         */
        const props: OverlayAsyncControllerProps<T> = { ...overlayProps, close, reject };
        return controller(props, ...deprecatedLegacyContext);
      }, options);
    });
  };

  const close = createEvent('close');
  const unmount = createEvent('unmount');
  const closeAll = createEvent('closeAll');
  const unmountAll = createEvent('unmountAll');

  return { open, openAsync, close, unmount, closeAll, unmountAll, useOverlayEvent };
}
