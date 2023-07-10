import { JsonConfig } from "./jsonConfig";
import { Logger } from "../logging";
import { ApplicationInsightsOptions, ExtendedMetricType, LogInstrumentationsConfig, OTLPExporterConfig } from "../../types";


export class InternalConfig implements ApplicationInsightsOptions {
    private _otlpTraceExporterConfig: OTLPExporterConfig;
    private _otlpMetricExporterConfig: OTLPExporterConfig;
    private _logInstrumentations: LogInstrumentationsConfig;
    public enableAutoCollectExceptions: boolean;
    public extendedMetrics: { [type: string]: boolean };

    constructor(options?: ApplicationInsightsOptions) {
        this._otlpMetricExporterConfig = {};
        this._otlpTraceExporterConfig = {};
        this.extendedMetrics = {};
        // Load config values from env variables and JSON if available
        this._loadDefaultValues();
        this._mergeConfig();
        // This will take precedence over other settings
        if (options) {
            this.enableAutoCollectExceptions =
                options.enableAutoCollectExceptions || this.enableAutoCollectExceptions;
            this.otlpMetricExporterConfig =
                options.otlpMetricExporterConfig || this.otlpMetricExporterConfig;
            this.otlpTraceExporterConfig = options.otlpTraceExporterConfig || this.otlpTraceExporterConfig;
            this.logInstrumentations = options.logInstrumentations || this.logInstrumentations;
        }
    }

    public set otlpTraceExporterConfig(value: OTLPExporterConfig) {
        this._otlpTraceExporterConfig = Object.assign(this._otlpTraceExporterConfig, value);
    }

    public get otlpTraceExporterConfig(): OTLPExporterConfig {
        return this._otlpTraceExporterConfig;
    }

    public set otlpMetricExporterConfig(value: OTLPExporterConfig) {
        this._otlpMetricExporterConfig = Object.assign(this._otlpMetricExporterConfig, value);
    }

    public get otlpMetricExporterConfig(): OTLPExporterConfig {
        return this._otlpMetricExporterConfig;
    }

    public set logInstrumentations(value: LogInstrumentationsConfig) {
        this._logInstrumentations = Object.assign(this._logInstrumentations, value);
    }

    public get logInstrumentations(): LogInstrumentationsConfig {
        return this._logInstrumentations;
    }

    /**
     * Get Instrumentation Key
     * @deprecated This method should not be used
     */
    public getDisableStatsbeat(): boolean {
        return false;
    }

    private _loadDefaultValues() {
        this.enableAutoCollectExceptions =
            this.enableAutoCollectExceptions !== undefined
                ? this.enableAutoCollectExceptions
                : true;
        this._logInstrumentations = {
            console: { enabled: false },
            bunyan: { enabled: false },
            winston: { enabled: false },
        };
        this.extendedMetrics[ExtendedMetricType.gc] = false;
        this.extendedMetrics[ExtendedMetricType.heap] = false;
        this.extendedMetrics[ExtendedMetricType.loop] = false;
    }

    private _mergeConfig() {
        try {
            const jsonConfig = JsonConfig.getInstance();
            this.otlpMetricExporterConfig =
                jsonConfig.otlpMetricExporterConfig !== undefined
                    ? jsonConfig.otlpMetricExporterConfig
                    : this.otlpMetricExporterConfig;
            this.otlpTraceExporterConfig =
                jsonConfig.otlpTraceExporterConfig !== undefined
                    ? jsonConfig.otlpTraceExporterConfig
                    : this.otlpTraceExporterConfig;
            this.enableAutoCollectExceptions =
                jsonConfig.enableAutoCollectExceptions !== undefined
                    ? jsonConfig.enableAutoCollectExceptions
                    : this.enableAutoCollectExceptions;
            if (jsonConfig.logInstrumentations) {
                if (
                    jsonConfig.logInstrumentations.console &&
                    jsonConfig.logInstrumentations.console.enabled !== undefined
                ) {
                    this.logInstrumentations.console.enabled =
                        jsonConfig.logInstrumentations.console.enabled;
                }
                if (
                    jsonConfig.logInstrumentations.bunyan &&
                    jsonConfig.logInstrumentations.bunyan.enabled !== undefined
                ) {
                    this.logInstrumentations.bunyan.enabled =
                        jsonConfig.logInstrumentations.bunyan.enabled;
                }
                if (
                    jsonConfig.logInstrumentations.winston &&
                    jsonConfig.logInstrumentations.winston.enabled !== undefined
                ) {
                    this.logInstrumentations.winston.enabled =
                        jsonConfig.logInstrumentations.winston.enabled;
                }
            }
            if (jsonConfig.extendedMetrics) {
                if (jsonConfig.extendedMetrics[ExtendedMetricType.gc] !== undefined) {
                    this.extendedMetrics[ExtendedMetricType.gc] =
                        jsonConfig.extendedMetrics[ExtendedMetricType.gc];
                }
                if (jsonConfig.extendedMetrics[ExtendedMetricType.heap] !== undefined) {
                    this.extendedMetrics[ExtendedMetricType.heap] =
                        jsonConfig.extendedMetrics[ExtendedMetricType.heap];
                }
                if (jsonConfig.extendedMetrics[ExtendedMetricType.loop] !== undefined) {
                    this.extendedMetrics[ExtendedMetricType.loop] =
                        jsonConfig.extendedMetrics[ExtendedMetricType.loop];
                }
            }
        } catch (error) {
            Logger.getInstance().error("Failed to load JSON config file values.", error);
        }
    }
}
