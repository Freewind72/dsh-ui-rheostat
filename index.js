window.__ModuleLoader__.load({
    id: "dsh-ui-rheostat",
    factory: (require) => {
        const module = { exports: {} };
        const exports = module.exports;
        const react = require("react");

        const name = "ui-rheostat";
        // LOCAL PATCH (2026-10-06): DSH 0.2.0-rc.2 builds the seat's directory with
        // `new ModelDirectory(this.ctx.remote.session, ...)` inside
        // ModelDirectoryResolver.directoryFor(); resolving `remote.session` is gated on
        // the *calling* context's injection, so without these two names the seat
        // crashes with `cannot get property "remote.session" without inject`
        // and the slot silently falls back to the built-in ModelSelect.
        const inject = ["slots", "modelDirectories", "sessions", "remote", "remote.session"];
        const slotName = "conversation.input.model";

        const css = `
/* Reasoning-effort seat — restyled to DSH's own menu language
   (radius/elevation/backdrop tokens + the 13px/34px row metrics used by
   @deepseek-ai/dsh-client-ui-model-selection/ModelSelect.module.css). */
.dsh-rheo-root {
    position: relative;
    display: inline-flex;
    min-width: 0;
}
.dsh-rheo-trigger {
    min-width: 0;
    max-width: min(280px, 45cqw);
    height: 28px;
    color: var(--dsw-alias-label-secondary);
    cursor: pointer;
    background: 0 0;
    border: none;
    border-radius: var(--dsw-radius-sm);
    outline: none;
    align-items: center;
    gap: 5px;
    padding: 0 6px 0 8px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    display: flex;
    transition: background .15s ease, color .15s ease;
}
.dsh-rheo-trigger:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
}
.dsh-rheo-trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
}
.dsh-rheo-trigger:disabled {
    color: var(--dsw-alias-label-dimmed);
    cursor: default;
}
.dsh-rheo-triggerLabel {
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
}
.dsh-rheo-triggerDot {
    flex: none;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
    opacity: .4;
}
.dsh-rheo-triggerEffort {
    color: var(--dsw-alias-label-caption);
    flex: none;
}
.dsh-rheo-chevron {
    color: var(--dsw-alias-label-caption);
    flex: none;
    transition: transform .18s ease;
}
.dsh-rheo-chevronOpen {
    transform: rotate(180deg);
}
.dsh-rheo-chevronBack {
    transform: rotate(180deg);
}
.dsh-rheo-menu {
    --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
    z-index: 1100;
    box-sizing: border-box;
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    display: flex;
    flex-direction: column;
    width: min(320px, 100vw - 32px);
    max-height: min(380px, 100vh - 96px);
    padding: 4px;
    border: 0;
    border-radius: var(--dsw-radius-lg);
    background: var(--dsw-specific-menu);
    backdrop-filter: var(--dsw-menu-backdrop-filter);
    box-shadow: var(--dsw-elevation-prominent);
    color: var(--dsw-alias-label-primary);
    overflow: hidden;
    animation: dsh-rheo-pop .14s ease-out;
}
.dsh-rheo-paneHead {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
    padding: 0 2px 4px;
}
.dsh-rheo-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--dsw-radius-sm);
    background: 0 0;
    color: var(--dsw-alias-label-secondary);
    cursor: pointer;
    transition: background .15s ease, color .15s ease;
}
.dsh-rheo-back:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
}
.dsh-rheo-paneTitle {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--dsw-alias-label-primary);
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
}
.dsh-rheo-modelRow {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 34px;
    padding: 0 8px;
    border: none;
    border-radius: var(--dsw-radius-md);
    background: 0 0;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background .15s ease;
}
.dsh-rheo-modelRow:hover {
    background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-rheo-modelRowLabel {
    flex: none;
    color: var(--dsw-alias-label-tertiary);
    font-size: 12px;
    line-height: 18px;
}
.dsh-rheo-modelRowValue {
    flex: 1 1 auto;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: var(--dsw-alias-label-primary);
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    text-align: right;
}
.dsh-rheo-modelList {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1 1 auto;
    min-height: 0;
    padding: 2px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--dsw-alias-scrollbar-bg-l2) transparent;
}
.dsh-rheo-modelList::-webkit-scrollbar {
    width: 8px;
}
.dsh-rheo-modelList::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: var(--dsw-alias-scrollbar-bg-l2);
}
.dsh-rheo-modelList::-webkit-scrollbar-thumb:hover {
    background: var(--dsw-alias-scrollbar-hover-l2);
}
.dsh-rheo-menuGroup {
    flex: none;
    padding: 6px 8px 3px;
    color: var(--dsw-alias-label-tertiary);
    font-size: 11px;
    font-weight: 500;
    line-height: 16px;
}
.dsh-rheo-menuItem {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 34px;
    padding: 6px 8px;
    border: none;
    border-radius: var(--dsw-radius-md);
    background: 0 0;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background .15s ease;
}
.dsh-rheo-menuItem:hover {
    background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-rheo-menuItemActive {
    background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-rheo-menuItemBlocked {
    color: var(--dsw-alias-label-tertiary);
    cursor: not-allowed;
}
.dsh-rheo-menuItemBlocked:hover {
    background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-rheo-menuItemBody {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    gap: 1px;
    min-width: 0;
}
.dsh-rheo-menuItemName {
    color: var(--dsw-alias-label-primary);
    font-size: 13px;
    line-height: 18px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.dsh-rheo-menuItemActive .dsh-rheo-menuItemName {
    font-weight: 500;
}
.dsh-rheo-menuItemDesc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: var(--dsw-alias-label-tertiary);
    font-size: 11px;
    line-height: 15px;
    overflow: hidden;
}
.dsh-rheo-menuItemCheck {
    flex: none;
    width: 14px;
    height: 14px;
    color: var(--dsw-alias-state-info-primary);
}
.dsh-rheo-menuItemNotice {
    position: relative;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--dsw-alias-state-warn-label, var(--dsw-alias-label-tertiary));
}
.dsh-rheo-menuItemTip {
    --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
    z-index: 1200;
    position: fixed;
    width: max-content;
    max-width: 240px;
    padding: 6px 8px;
    border: 0;
    border-radius: var(--dsw-radius-md);
    background: var(--dsw-specific-menu);
    backdrop-filter: var(--dsw-menu-backdrop-filter);
    box-shadow: var(--dsw-elevation-prominent);
    color: var(--dsw-alias-label-primary);
    font-size: 12px;
    line-height: 18px;
    white-space: normal;
    pointer-events: none;
}
.dsh-rheo-menuStatus, .dsh-rheo-menuEmpty {
    color: var(--dsw-alias-label-tertiary);
    padding: 8px;
    font-size: 12px;
    line-height: 18px;
}
.dsh-rheo-menuError {
    border-radius: var(--dsw-radius-md);
    background: var(--dsw-alias-interactive-bg-hover-danger);
    color: var(--dsw-alias-state-error-primary);
    margin: 4px 2px;
    padding: 6px 8px;
    font-size: 11px;
    line-height: 16px;
}
.dsh-rheo-menuDivider {
    flex: none;
    height: 1px;
    margin: 4px 6px;
    background: var(--dsw-alias-border-l1);
}
.dsh-rheo-sliderWrap {
    display: flex;
    flex-direction: column;
    flex: none;
    gap: 2px;
    padding: 4px 8px 6px;
}
.dsh-rheo-sliderHead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    color: var(--dsw-alias-label-secondary);
    font-size: 12px;
    line-height: 18px;
}
.dsh-rheo-sliderHead strong {
    color: var(--dsw-alias-label-primary);
    font-size: 13px;
    font-weight: 500;
}
.dsh-rheo-sliderRail {
    position: relative;
    height: 38px;
    margin: 4px 0 2px;
}
.dsh-rheo-sliderGroove {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    height: 24px;
    border-radius: 999px;
    overflow: hidden;
    transform: translateY(-50%);
    pointer-events: none;
}
.dsh-rheo-sliderTrack {
    position: absolute;
    inset: 0;
    background: var(--dsw-alias-interactive-bg-hover);
    border-radius: inherit;
}
.dsh-rheo-sliderFill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
    border-radius: inherit;
    background: linear-gradient(90deg, #4f8cff 0%, #7b6cff 100%);
    transition: width .28s ease;
}
.dsh-rheo-sliderBloom {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(90deg, #4f8cff 0%, #7b6cff 52%, #b56bff 100%);
    opacity: 0;
    transition: opacity .28s ease;
}
.dsh-rheo-sliderFillMax .dsh-rheo-sliderBloom {
    opacity: 1;
}
.dsh-rheo-particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    container-type: inline-size;
}
.dsh-rheo-particle {
    position: absolute;
    top: var(--dsh-rheo-particle-top, 50%);
    left: 100%;
    width: var(--dsh-rheo-particle-w, 7px);
    height: var(--dsh-rheo-particle-h, 3px);
    margin-top: calc(var(--dsh-rheo-particle-h, 3px) / -2);
    border-radius: 999px;
    background: linear-gradient(90deg, rgb(255 255 255 / var(--dsh-rheo-particle-opacity, .8)) 0%, rgb(255 255 255 / 0%) 100%);
    box-shadow: 0 0 5px rgb(255 255 255 / 45%);
    animation: dsh-rheo-particle-drift var(--dsh-rheo-particle-duration, 2.4s) linear infinite;
    animation-delay: var(--dsh-rheo-particle-delay, 0s);
}
@keyframes dsh-rheo-particle-drift {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(calc(-100cqw - 12px));
    }
}
@media (prefers-reduced-motion: reduce) {
    .dsh-rheo-particle {
        animation: none;
        opacity: 0;
    }
}
.dsh-rheo-sliderKnob {
    position: absolute;
    z-index: 4;
    top: 50%;
    width: 30px;
    height: 30px;
    margin-left: -15px;
    transform: translateY(-50%);
    pointer-events: none;
    transition: left .28s ease;
}
.dsh-rheo-sliderKnobFace {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 0 .5px rgb(0 0 0 / 16%), 0 1px 3px rgb(0 0 0 / 32%);
    transition: transform .14s ease, box-shadow .14s ease;
}
.dsh-rheo-sliderRail:hover .dsh-rheo-sliderKnobFace {
    transform: scale(1.12);
}
.dsh-rheo-sliderRail:has(.dsh-rheo-slider:focus-visible) .dsh-rheo-sliderKnobFace {
    box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)), 0 1px 3px rgb(0 0 0 / 32%);
}
.dsh-rheo-sliderTicks {
    position: absolute;
    z-index: 2;
    top: 50%;
    right: 15px;
    left: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateY(-50%);
    pointer-events: none;
}
.dsh-rheo-sliderTick {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--dsw-alias-label-dimmed);
}
.dsh-rheo-sliderTickActive {
    background: rgb(255 255 255 / 44%);
}
.dsh-rheo-slider {
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    z-index: 3;
    top: 50%;
    right: 0;
    left: 0;
    width: 100%;
    height: 38px;
    margin: 0;
    transform: translateY(-50%);
    background: transparent;
    color: transparent;
    accent-color: transparent;
    cursor: pointer;
    outline: none;
}
.dsh-rheo-slider:disabled {
    cursor: wait;
    opacity: .55;
}
.dsh-rheo-slider::-webkit-slider-runnable-track {
    height: 24px;
    border: none;
    border-radius: 999px;
    background: transparent;
}
.dsh-rheo-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    margin-top: -3px;
    border: none;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
}
.dsh-rheo-slider::-moz-range-track, .dsh-rheo-slider::-moz-range-progress {
    height: 24px;
    border: none;
    border-radius: 999px;
    background: transparent;
}
.dsh-rheo-slider::-moz-range-thumb {
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
}
.dsh-rheo-sliderDesc {
    margin: 0;
    color: var(--dsw-alias-label-tertiary);
    font-size: 11px;
    line-height: 16px;
}
@keyframes dsh-rheo-pop {
    from {
        opacity: 0;
        transform: translateY(4px) scale(.985);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
`;

        // Inject styles at module load, exactly like the original ModelSelect
        // bundle does — the client sandbox may not run effect callbacks.
        const STYLE_TAG_ID = "dsh-ui-rheostat/seat.css";
        if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG_ID)}]`) === null) {
            const tag = document.createElement("style");
            tag.dataset.plugin = "dsh-ui-rheostat";
            tag.dataset.pluginCss = STYLE_TAG_ID;
            tag.textContent = css;
            document.head.appendChild(tag);
        }

        function effortIndex(levels, current) {
            const index = levels.findIndex((level) => level.id === current);
            return index >= 0 ? index : Math.floor((levels.length - 1) / 2);
        }

        function modelKey(provider, model) {
            return `${provider}/${model}`;
        }

        function explainSelectionError(message) {
            if (typeof message !== "string" || message.length === 0) return "无法切换模型";
            if (message.includes("does not accept image input") || message.includes("already contains images")) {
                return IMAGE_BLOCK_REASON;
            }
            if (message.includes("does not support reasoning effort")) {
                return "此模型不支持当前推理强度";
            }
            return message;
        }

        // Same glyphs as DSH's IconChevronDownOutline14 / IconChevronRightOutline14.
        const ICON_CHEVRON_DOWN = "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z";
        const ICON_CHEVRON_RIGHT = "M5.5 2.15137L5.92383 2.57617L8.65137 5.30273C8.90706 5.55843 9.13382 5.78438 9.29785 5.98828C9.46883 6.20088 9.61756 6.44405 9.66602 6.75C9.69222 6.91565 9.69222 7.08435 9.66602 7.25C9.61756 7.55595 9.46883 7.79912 9.29785 8.01172C9.13382 8.21561 8.90706 8.44157 8.65137 8.69727L5.92383 11.4238L5.5 11.8486L4.65137 11L5.07617 10.5762L7.80273 7.84863C8.07732 7.57405 8.24849 7.40124 8.3623 7.25977C8.46904 7.12709 8.47813 7.07728 8.48047 7.0625C8.48703 7.02105 8.48703 6.97895 8.48047 6.9375C8.47813 6.92272 8.46904 6.87291 8.3623 6.74023C8.24848 6.59876 8.07732 6.42595 7.80273 6.15137L5.07617 3.42383L4.65137 3L5.5 2.15137Z";
        const ICON_WARNING_BAR = "M6.3002 3.32843L7.69986 3.32843L7.69986 7.79657H6.3002L6.3002 3.32843Z";
        const ICON_WARNING_DOT = "M6.3002 9.01935H7.69986V10.6711H6.3002V9.01935Z";
        const ICON_WARNING_RING = "M12.6328 6.99976C12.6328 3.88874 10.111 1.36694 7 1.36694C3.88899 1.36695 1.3672 3.88875 1.36719 6.99976C1.36719 10.1108 3.88899 12.6326 7 12.6326C10.111 12.6326 12.6328 10.1108 12.6328 6.99976ZM13.8582 6.99976C13.8582 10.7873 10.7876 13.8579 7 13.8579C3.21244 13.8579 0.141846 10.7873 0.141846 6.99976C0.141857 3.2122 3.21245 0.141612 7 0.141602C10.7876 0.141602 13.8581 3.21219 13.8582 6.99976Z";
        const IMAGE_BLOCK_REASON = "当前草稿包含图片，此模型不支持图片输入";
        const DEEPSEEK_FLASH_VISION_EXP_MODEL = "deepseek-v4-flash-vision-exp";

        const chevronIcon = (path, className) => react.createElement(
            "svg",
            { className, width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
            react.createElement("path", { d: path, fill: "currentColor" })
        );

        const warningIcon = (className) => react.createElement(
            "svg",
            { className, width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
            react.createElement("path", { d: ICON_WARNING_BAR, fill: "currentColor" }),
            react.createElement("path", { d: ICON_WARNING_DOT, fill: "currentColor" }),
            react.createElement("path", { d: ICON_WARNING_RING, fill: "currentColor" })
        );

        const checkIcon = (className) => react.createElement(
            "svg",
            { className, width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
            react.createElement("path", {
                d: "M3.1 7.45L5.65 10L10.9 4.3",
                stroke: "currentColor",
                strokeWidth: 1.6,
                strokeLinecap: "round",
                strokeLinejoin: "round"
            })
        );

        // Particle stream that flows right-to-left across the bar at the top effort level.
const PARTICLE_SPECS = [
    { w: 9, h: 3, top: 40, opacity: 0.95, duration: 2.2, delay: 0 },
    { w: 6, h: 2, top: 58, opacity: 0.65, duration: 2.5, delay: -0.22 },
    { w: 8, h: 3, top: 50, opacity: 1, duration: 2.35, delay: -0.45 },
    { w: 5, h: 2, top: 34, opacity: 0.6, duration: 2.6, delay: -0.68 },
    { w: 7, h: 3, top: 64, opacity: 0.8, duration: 2.3, delay: -0.9 },
    { w: 6, h: 2, top: 46, opacity: 0.55, duration: 2.55, delay: -1.13 },
    { w: 9, h: 3, top: 55, opacity: 0.9, duration: 2.4, delay: -1.35 },
    { w: 5, h: 2, top: 38, opacity: 0.5, duration: 2.65, delay: -1.58 },
    { w: 7, h: 3, top: 62, opacity: 0.75, duration: 2.28, delay: -1.8 },
    { w: 6, h: 2, top: 44, opacity: 0.6, duration: 2.5, delay: -2.03 },
    { w: 8, h: 3, top: 52, opacity: 0.85, duration: 2.33, delay: -2.25 },
    { w: 5, h: 2, top: 60, opacity: 0.5, duration: 2.62, delay: -2.48 }
];
function knownTextOnlyModel(provider, model) {
            return provider === "deepseek-official" && model.id !== DEEPSEEK_FLASH_VISION_EXP_MODEL;
        }

        function defaultUseInput(select) {
            return select({ draft: "", imageIds: [], draftRev: 0, phase: "plain", occurrences: [], queue: [] });
        }

        function EffortSliderSeat({ locked, available, directory, load, select, useSession, useInput }) {
            const state = react.useSyncExternalStore(
                (listener) => directory.subscribe(listener),
                () => directory.getSnapshot()
            );

            const [open, setOpen] = react.useState(false);
            const [modelsOpen, setModelsOpen] = react.useState(false);
            const [blockedModels, setBlockedModels] = react.useState({});
            const [hoveredNotice, setHoveredNotice] = react.useState(null);
            const [initialLoading, setInitialLoading] = react.useState(true);
            const [draft, setDraft] = react.useState(-1);
            const [pendingIndex, setPendingIndex] = react.useState(-1);
            const rootRef = react.useRef(null);
            const triggerRef = react.useRef(null);
            const panelRef = react.useRef(null);
            const inputSnapshot = (useInput ?? defaultUseInput)((s) => s);
            const draftHasImages = inputSnapshot !== null && inputSnapshot !== undefined && (inputSnapshot.imageIds?.length ?? 0) > 0;

            react.useEffect(() => {
                if (available) {
                    load().then(() => setInitialLoading(false), () => setInitialLoading(false));
                }
            }, [available, load]);

            react.useEffect(() => {
                if (!open) setHoveredNotice(null);
            }, [open]);

            react.useEffect(() => {
                if (!open) return;
                const closeOutside = (event) => {
                    if (!rootRef.current?.contains(event.target)) setOpen(false);
                };
                document.addEventListener("mousedown", closeOutside);
                return () => document.removeEventListener("mousedown", closeOutside);
            }, [open]);

            const currentChoice = react.useMemo(() => {
                if (state.current === null) return undefined;
                for (const group of state.groups) {
                    const model = group.models.find((candidate) => candidate.id === state.current.model);
                    if (model !== undefined && group.id === state.current.provider) {
                        return { group, model };
                    }
                }
                return undefined;
            }, [state.current?.provider, state.current?.model, state.groups]);

            // A committed model switch replaces the effort server-side; reset the
            // local draft so the thumb follows the real selection.
            react.useEffect(() => {
                setDraft(-1);
                setPendingIndex(-1);
            }, [state.current?.provider, state.current?.model]);

            if (!available) return null;

            const busy = state.status === "selecting" || state.status === "loading";
            const currentEffort = state.current?.reasoningEffort
                ?? currentChoice?.model.reasoning?.defaultEffort
                ?? undefined;
            const levels = currentChoice?.model.reasoning?.efforts ?? [];
            const currentIndex = currentChoice === undefined ? -1 : effortIndex(levels, currentEffort);
            const currentLevel = currentChoice === undefined ? undefined : levels[currentIndex];
            const effortLabel = currentLevel === undefined
                ? undefined
                : currentLevel.name ?? currentEffort;
            const modelLabel = currentChoice === undefined
                ? "选择模型"
                : currentChoice.model.name;
            const fullLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`;

            const chooseModel = (group, model) => {
                const key = modelKey(group.id, model.id);
                if (blockedModels[key] !== undefined) return;
                if (state.current?.provider === group.id && state.current.model === model.id) {
                    setModelsOpen(false);
                    return;
                }
                const selection = {
                    provider: group.id,
                    model: model.id,
                    ...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
                };
                select(selection).then((accepted) => {
                    if (!accepted) {
                        setBlockedModels((current) => ({
                            ...current,
                            [key]: explainSelectionError(directory.getSnapshot().error)
                        }));
                        return;
                    }
                    setDraft(-1);
                    setPendingIndex(-1);
                    setModelsOpen(false);
                });
            };

            const updateDraft = (event) => {
                setDraft(Number(event.currentTarget.value));
            };

            // CSS hover on .dsh-rheo-sliderRail now handles knob scaling.

            // Commit the live thumb value on release. Keep the local pin until
            // the store catches up so the knob does not snap back.
            const commitEffort = (event) => {
                const nextIndex = Number(event?.currentTarget?.value ?? draft);
                if (!Number.isFinite(nextIndex) || nextIndex < 0 || busy) return;
                const nextEffort = levels[nextIndex]?.id;
                if (nextEffort === undefined || nextEffort === currentEffort) {
                    setDraft(-1);
                    setPendingIndex(-1);
                    return;
                }
                setDraft(nextIndex);
                setPendingIndex(nextIndex);
                select({
                    provider: state.current.provider,
                    model: state.current.model,
                    reasoningEffort: nextEffort
                });
            };

            react.useEffect(() => {
                if (pendingIndex < 0) return;
                if (currentIndex === pendingIndex) {
                    setDraft(-1);
                    setPendingIndex(-1);
                }
            }, [currentIndex, pendingIndex]);

            const onSliderKeyUp = (event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
                    commitEffort(event);
                }
            };

            // Secondary menu: model picker, shown when the model row is clicked.
            if (state.groups.length === 0 && state.status !== "loading" && !initialLoading) {
                console.warn("[ui-rheostat] no available models", {
                    status: state.status,
                    initialLoading,
                    error: state.error,
                    current: state.current
                });
            }
            const modelList = (state.status === "loading" || initialLoading) && state.groups.length === 0
                ? react.createElement("div", { className: "dsh-rheo-menuStatus" }, "加载中…")
                : state.groups.length === 0
                    ? state.error
                        ? react.createElement("div", { className: "dsh-rheo-menuError" }, state.error)
                        : react.createElement("div", { className: "dsh-rheo-menuEmpty" }, "没有可用的模型。")
                    : state.groups.map((group) => react.createElement(
                        react.Fragment,
                        { key: group.id },
                        react.createElement("div", { className: "dsh-rheo-menuGroup" }, group.name),
                        group.models.map((model) => {
                            const active = state.current?.provider === group.id && state.current.model === model.id;
                            const failedReason = blockedModels[modelKey(group.id, model.id)];
                            const imageBlocked = draftHasImages && knownTextOnlyModel(group.id, model);
                            const warned = failedReason !== undefined || imageBlocked;
                            const blocked = failedReason !== undefined;
                            const noticeReason = failedReason ?? (imageBlocked ? IMAGE_BLOCK_REASON : undefined);
                            return react.createElement(
                                "button",
                                {
                                    key: model.id,
                                    type: "button",
                                    role: "menuitemradio",
                                    "aria-checked": active,
                                    className: [
                                        "dsh-rheo-menuItem",
                                        active ? "dsh-rheo-menuItemActive" : "",
                                        blocked ? "dsh-rheo-menuItemBlocked" : ""
                                    ].filter(Boolean).join(" "),
                                    "aria-disabled": blocked,
                                    onClick: () => chooseModel(group, model)
                                },
                                react.createElement(
                                    "span",
                                    { className: "dsh-rheo-menuItemBody" },
                                    react.createElement("span", { className: "dsh-rheo-menuItemName" }, model.name),
                                    model.description !== void 0
                                        ? react.createElement("span", { className: "dsh-rheo-menuItemDesc" }, model.description)
                                        : null
                                ),
                                warned
                                    ? react.createElement(
                                        "span",
                                        {
                                            className: "dsh-rheo-menuItemNotice",
                                            tabIndex: 0,
                                            onMouseEnter: (event) => {
                                                const box = event.currentTarget.getBoundingClientRect();
                                                setHoveredNotice({
                                                    text: noticeReason,
                                                    left: Math.round(box.right - 8),
                                                    top: Math.round(box.bottom + 6)
                                                });
                                            },
                                            onMouseLeave: () => setHoveredNotice(null)
                                        },
                                        warningIcon()
                                    )
                                    : active
                                        ? checkIcon("dsh-rheo-menuItemCheck")
                                        : null
                            );
                        })
                    ));

            // Always-visible slider block below the model row.
            // Dragging updates only the local draft (fluid); the selection is
            // committed on release / keyboard confirm.
            const displayedIndex = draft >= 0 ? draft : pendingIndex >= 0 ? pendingIndex : currentIndex;
            const displayedLevel = levels[displayedIndex];
            const maxIndex = levels.length - 1;
            const fillPct = levels.length <= 1 ? 100 : Math.round((displayedIndex / maxIndex) * 100);
            const atMax = displayedIndex >= levels.length - 1;
            const thumbRadius = 15;
            const travel = `calc(${fillPct}% + ${Math.round(thumbRadius - (thumbRadius * 2 * fillPct) / 100)}px)`;
            const knobLeft = atMax || levels.length <= 1
                ? `calc(100% - ${thumbRadius}px)`
                : fillPct <= 0
                    ? `${thumbRadius}px`
                    : travel;
            // Fill always ends at the knob center; at max that is
            // calc(100% - 15px), never 100%, so no color bleeds past the knob.
            const fillWidth = fillPct <= 0
                ? "0px"
                : travel;

            const slider = currentChoice !== undefined && levels.length > 0
                ? react.createElement(
                    "div",
                    { className: "dsh-rheo-sliderWrap" },
                    react.createElement(
                        "div",
                        { className: "dsh-rheo-sliderHead" },
                        react.createElement("span", null, "推理强度"),
                        react.createElement("strong", null, displayedLevel?.name ?? currentEffort)
                    ),
                    react.createElement(
                        "div",
                        { className: "dsh-rheo-sliderRail" },
                        react.createElement(
                            "div",
                            { className: "dsh-rheo-sliderGroove", "aria-hidden": true },
                            react.createElement("div", { className: "dsh-rheo-sliderTrack" }),
                            react.createElement("div", {
                                className: atMax ? "dsh-rheo-sliderFill dsh-rheo-sliderFillMax" : "dsh-rheo-sliderFill",
                                style: { width: fillWidth }
                            }, react.createElement("div", { className: "dsh-rheo-sliderBloom" }), atMax
                                ? react.createElement("div", { className: "dsh-rheo-particles", "aria-hidden": true }, PARTICLE_SPECS.map((spec, index) => react.createElement("span", {
                                    key: index,
                                    className: "dsh-rheo-particle",
                                    style: {
                                        "--dsh-rheo-particle-w": spec.w + "px",
                                        "--dsh-rheo-particle-h": spec.h + "px",
                                        "--dsh-rheo-particle-top": spec.top + "%",
                                        "--dsh-rheo-particle-opacity": spec.opacity,
                                        "--dsh-rheo-particle-duration": spec.duration + "s",
                                        "--dsh-rheo-particle-delay": spec.delay + "s"
                                    }
                                })))
                                : null)
                        ),
                        react.createElement(
                            "div",
                            {
                                className: "dsh-rheo-sliderKnob",
                                "aria-hidden": true,
                                style: { left: knobLeft }
                            },
                            react.createElement("div", { className: "dsh-rheo-sliderKnobFace" })
                        ),
                        react.createElement(
                            "div",
                            { className: "dsh-rheo-sliderTicks", "aria-hidden": true },
                            levels.map((level, index) => react.createElement("span", {
                                key: level.id,
                                className: index <= displayedIndex ? "dsh-rheo-sliderTick dsh-rheo-sliderTickActive" : "dsh-rheo-sliderTick"
                            }))
                        ),
                        react.createElement("input", {
                            className: "dsh-rheo-slider",
                            type: "range",
                            min: 0,
                            max: Math.max(levels.length - 1, 0),
                            step: 1,
                            value: displayedIndex,
                            disabled: locked,
                            onInput: updateDraft,
                            onChange: updateDraft,
                            onMouseUp: commitEffort,
                            onTouchEnd: commitEffort,
                            onKeyUp: onSliderKeyUp,
                            "aria-label": "推理强度"
                        })
                    ),
                    displayedLevel?.description
                        ? react.createElement("p", { className: "dsh-rheo-sliderDesc" }, displayedLevel.description)
                        : null
                )
                : null;

            // One card, two panes: the effort pane and the model pane share the
            // same surface, so nothing is clipped by a nested floating window.
            const menu = open ? react.createElement(
                "div",
                {
                    ref: panelRef,
                    className: "dsh-rheo-menu",
                    role: "menu",
                    style: { position: "absolute", bottom: "calc(100% + 8px)", right: "0" }
                },
                modelsOpen
                    ? react.createElement(
                        react.Fragment,
                        null,
                        react.createElement(
                            "div",
                            { className: "dsh-rheo-paneHead" },
                            react.createElement(
                                "button",
                                {
                                    type: "button",
                                    className: "dsh-rheo-back",
                                    "aria-label": "返回",
                                    onClick: () => setModelsOpen(false)
                                },
                                chevronIcon(ICON_CHEVRON_RIGHT, "dsh-rheo-chevron dsh-rheo-chevronBack")
                            ),
                            react.createElement("span", { className: "dsh-rheo-paneTitle" }, "选择模型")
                        ),
                        react.createElement("div", { className: "dsh-rheo-modelList" }, modelList)
                    )
                    : react.createElement(
                        react.Fragment,
                        null,
                        react.createElement(
                            "button",
                            {
                                type: "button",
                                className: "dsh-rheo-modelRow",
                                "aria-haspopup": "menu",
                                "aria-expanded": modelsOpen,
                                onClick: () => setModelsOpen(true)
                            },
                            react.createElement("span", { className: "dsh-rheo-modelRowLabel" }, "模型"),
                            react.createElement("span", { className: "dsh-rheo-modelRowValue" }, currentChoice?.model.name ?? "—"),
                            chevronIcon(ICON_CHEVRON_RIGHT, "dsh-rheo-chevron")
                        ),
                        slider === null
                            ? null
                            : react.createElement(
                                react.Fragment,
                                null,
                                react.createElement("div", { className: "dsh-rheo-menuDivider" }),
                                slider
                            )
                    )
            ) : null;

            return react.createElement(
                "div",
                {
                    className: "dsh-rheo-root",
                    "data-dsh-plugin": name,
                    ref: rootRef,
                    style: { position: "relative", display: "inline-flex" },
                    onKeyDown: (event) => {
                        if (event.key !== "Escape") return;
                        if (modelsOpen) setModelsOpen(false);
                        else setOpen(false);
                    }
                },
                react.createElement(
                    "button",
                    {
                        ref: triggerRef,
                        type: "button",
                        className: "dsh-rheo-trigger",
                        "aria-label": fullLabel,
                        "aria-haspopup": "menu",
                        "aria-expanded": open,
                        title: fullLabel,
                        disabled: locked,
                        onClick: () => {
                            setOpen((value) => !value);
                            setModelsOpen(false);
                        }
                    },
                    react.createElement("span", { className: "dsh-rheo-triggerLabel" }, modelLabel),
                    effortLabel !== undefined
                        ? react.createElement("span", { className: "dsh-rheo-triggerDot", "aria-hidden": true })
                        : null,
                    effortLabel !== undefined
                        ? react.createElement("span", { className: "dsh-rheo-triggerEffort" }, effortLabel)
                        : null,
                    chevronIcon(ICON_CHEVRON_DOWN, open ? "dsh-rheo-chevron dsh-rheo-chevronOpen" : "dsh-rheo-chevron")
                ),
                menu,
                hoveredNotice
                    ? react.createElement(
                        "div",
                        {
                            className: "dsh-rheo-menuItemTip",
                            role: "tooltip",
                            style: {
                                left: `${hoveredNotice.left}px`,
                                top: `${hoveredNotice.top}px`,
                                transform: "translateX(-100%)"
                            }
                        },
                        hoveredNotice.text
                    )
                    : null
            );
        }

        const apply = (ctx) => {
            ctx.inject(inject, (scope) => {
                const slots = scope.get("slots");
                const models = scope.get("modelDirectories");
                const sessions = scope.get("sessions");

                return slots.inject(slotName, () => slots.register({
                    name: slotName,
                    priority: -100,
                    inject: (sessionId) => {
                        const directory = models.directoryFor(sessionId);
                        const available = sessions.subagentAddress(sessionId) === void 0;
                        const snapshot = directory.store?.getSnapshot?.();
                        console.log("[ui-rheostat] directory", {
                            sessionId,
                            available,
                            status: snapshot?.status,
                            groupCount: snapshot?.groups?.length ?? 0,
                            error: snapshot?.error ?? null,
                            current: snapshot?.current ?? null
                        });
                        return {
                            available,
                            directory: directory.store,
                            load: () => {
                                if (available) return directory.load().catch(() => {});
                                return Promise.resolve();
                            },
                            select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
                        };
                    }
                }, EffortSliderSeat));
            });
        };

        const Config = {
            "~standard": {
                version: 1,
                vendor: "dsh-ui-rheostat",
                validate(config) {
                    if (config === undefined || config === null) return { value: {} };
                    if (typeof config !== "object" || Array.isArray(config)) {
                        return {
                            issues: [{
                                message: "plugin config must be an object"
                            }]
                        };
                    }
                    return { value: config };
                }
            }
        };

        exports.name = name;
        exports.inject = inject;
        exports.apply = apply;
        exports.Config = Config;
        return module.exports;
    }
});
