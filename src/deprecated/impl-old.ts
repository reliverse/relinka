/* =======================================
START OF DEPRECATED FUNCTIONS SECTION
==========================================

// Cache for config file stats to avoid unnecessary reloads
let configFileStats: { mtime: number; path: string } | null = null;

// Check if config needs to be reloaded by comparing mtimes
async function shouldReloadConfig(): Promise<boolean> {
  try {
    const configFile = await loadConfig<RelinkaConfig>({
      name: "relinka",
      cwd: process.cwd(),
      dotenv: false,
      packageJson: false,
      rcFile: false,
      globalRc: false,
      defaults: DEFAULT_RELINKA_CONFIG,
    });

    if (!configFile.configFile) return false;

    const stats = await fs.stat(configFile.configFile);

    if (!configFileStats || configFileStats.path !== configFile.configFile) {
      configFileStats = {
        mtime: stats.mtime.getTime(),
        path: configFile.configFile,
      };
      return true;
    }

    if (stats.mtime.getTime() !== configFileStats.mtime) {
      configFileStats = {
        mtime: stats.mtime.getTime(),
        path: configFile.configFile,
      };
      return true;
    }

    return false;
  } catch (err) {
    if (isVerboseEnabled(currentConfig)) {
      console.error(
        `[Relinka Config Check Error] ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return false;
  }
}

// Check if config needs to be reloaded by comparing mtimes (synchronous version)
function shouldReloadConfigSync(): boolean {
  try {
    const configPath = path.resolve(process.cwd(), "relinka.config.ts");
    if (!fs.existsSync(configPath)) return false;

    const stats = fs.statSync(configPath);

    if (!configFileStats || configFileStats.path !== configPath) {
      configFileStats = { mtime: stats.mtime.getTime(), path: configPath };
      return true;
    }

    if (stats.mtime.getTime() !== configFileStats.mtime) {
      configFileStats = { mtime: stats.mtime.getTime(), path: configPath };
      return true;
    }

    return false;
  } catch (err) {
    if (isVerboseEnabled(currentConfig)) {
      console.error(
        `[Relinka Config Check Error] ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return false;
  }
}

// Load config if needed, using caching
async function loadConfigIfNeeded(): Promise<void> {
  if (!isConfigInitialized || (await shouldReloadConfig())) {
    await initializeConfig();
  }
}

// Load config if needed, using caching (synchronous version)
function loadConfigIfNeededSync(): void {
  if (!isConfigInitialized || shouldReloadConfigSync()) {
    try {
      // For sync operations, we'll use the default config
      // Config will be properly loaded async later
      currentConfig = { ...DEFAULT_RELINKA_CONFIG };
      isConfigInitialized = true;

      if (ENABLE_DEV_DEBUG) {
        console.log("[Dev Debug] Using default config for sync operation");
        console.log("[Dev Debug] Final configuration:", currentConfig);
      }

      if (resolveRelinkaConfig) {
        resolveRelinkaConfig(currentConfig);
      }

      // Trigger async config load in background
      initializeConfig().catch((err) => {
        if (isVerboseEnabled(currentConfig)) {
          console.error(
            `[Relinka Config Error] Background load failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      });
    } catch (err) {
      console.error(
        `[Relinka Config Error] Failed to load config: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      currentConfig = { ...DEFAULT_RELINKA_CONFIG };
      isConfigInitialized = true;
      if (resolveRelinkaConfig) {
        resolveRelinkaConfig(currentConfig);
      }
    }
  }
}

==========================================
THE END OF DEPRECATED FUNCTIONS SECTION
======================================= */
