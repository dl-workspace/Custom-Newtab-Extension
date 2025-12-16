/**
 * Storage wrapper that uses browser.storage.local with in-memory caching
 * This works in Firefox private browsing mode unlike localStorage
 */
(function(e) {
    "use strict";

    // In-memory cache for synchronous access
    var _cache = {};
    var _initialized = false;
    var _initPromise = null;
    var _pendingWrites = {};
    var _writeTimeout = null;

    var storage = {
        /**
         * Initialize storage by loading all data into memory cache
         * Returns a promise that resolves when ready
         */
        init: function() {
            if (_initPromise) {
                return _initPromise;
            }

            _initPromise = new Promise(function(resolve, reject) {
                // First, try to migrate from localStorage if this is first run
                browser.storage.local.get(null).then(function(data) {
                    if (data && Object.keys(data).length > 0) {
                        // Storage already has data, use it
                        _cache = data;
                        _initialized = true;
                        resolve();
                    } else {
                        // No data in browser.storage.local, migrate from localStorage
                        storage._migrateFromLocalStorage().then(function() {
                            _initialized = true;
                            resolve();
                        }).catch(function(err) {
                            console.error("Storage migration error:", err);
                            _initialized = true;
                            resolve(); // Continue anyway with empty cache
                        });
                    }
                }).catch(function(err) {
                    console.error("Storage init error:", err);
                    // Fallback: try to use localStorage data directly in cache
                    try {
                        for (var i = 0; i < localStorage.length; i++) {
                            var key = localStorage.key(i);
                            _cache[key] = localStorage.getItem(key);
                        }
                    } catch (e) {
                        // localStorage not available (private mode)
                    }
                    _initialized = true;
                    resolve();
                });
            });

            return _initPromise;
        },

        /**
         * Migrate all localStorage data to browser.storage.local
         */
        _migrateFromLocalStorage: function() {
            return new Promise(function(resolve, reject) {
                try {
                    var data = {};
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        data[key] = localStorage.getItem(key);
                    }
                    if (Object.keys(data).length > 0) {
                        browser.storage.local.set(data).then(function() {
                            _cache = data;
                            resolve();
                        }).catch(reject);
                    } else {
                        resolve();
                    }
                } catch (e) {
                    // localStorage not available (private mode)
                    resolve();
                }
            });
        },

        /**
         * Check if storage is initialized
         */
        isReady: function() {
            return _initialized;
        },

        /**
         * Get a value from cache (synchronous)
         * @param {string} key - The key to retrieve
         * @returns {string|null} - The value or null if not found
         */
        getItem: function(key) {
            if (!_initialized) {
                // Fallback to localStorage if not initialized yet
                try {
                    return localStorage.getItem(key);
                } catch (e) {
                    return null;
                }
            }
            var value = _cache[key];
            return value !== undefined ? value : null;
        },

        /**
         * Set a value in cache and queue for async write (synchronous API)
         * @param {string} key - The key to set
         * @param {string} value - The value to store
         */
        setItem: function(key, value) {
            _cache[key] = value;

            // Also update localStorage as backup (if available)
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                // localStorage not available (private mode)
            }

            // Queue for async write to browser.storage.local
            _pendingWrites[key] = value;
            storage._scheduleWrite();
        },

        /**
         * Remove a value from cache and storage
         * @param {string} key - The key to remove
         */
        removeItem: function(key) {
            delete _cache[key];

            // Also remove from localStorage as backup (if available)
            try {
                localStorage.removeItem(key);
            } catch (e) {
                // localStorage not available
            }

            // Queue for async removal
            browser.storage.local.remove(key).catch(function(err) {
                console.error("Storage remove error:", err);
            });
        },

        /**
         * Clear all storage
         */
        clear: function() {
            _cache = {};

            try {
                localStorage.clear();
            } catch (e) {
                // localStorage not available
            }

            browser.storage.local.clear().catch(function(err) {
                console.error("Storage clear error:", err);
            });
        },

        /**
         * Get all keys in storage
         * @returns {string[]} - Array of keys
         */
        keys: function() {
            return Object.keys(_cache);
        },

        /**
         * Get the number of items in storage
         * @returns {number}
         */
        get length() {
            return Object.keys(_cache).length;
        },

        /**
         * Get a key by index (for compatibility)
         * @param {number} index
         * @returns {string|null}
         */
        key: function(index) {
            var keys = Object.keys(_cache);
            return keys[index] || null;
        },

        /**
         * Schedule a debounced write to browser.storage.local
         */
        _scheduleWrite: function() {
            if (_writeTimeout) {
                clearTimeout(_writeTimeout);
            }

            _writeTimeout = setTimeout(function() {
                if (Object.keys(_pendingWrites).length > 0) {
                    var toWrite = _pendingWrites;
                    _pendingWrites = {};

                    browser.storage.local.set(toWrite).catch(function(err) {
                        console.error("Storage write error:", err);
                        // Re-queue failed writes
                        Object.assign(_pendingWrites, toWrite);
                        storage._scheduleWrite();
                    });
                }
            }, 100); // Debounce writes by 100ms
        },

        /**
         * Force immediate write of all pending changes
         * @returns {Promise}
         */
        flush: function() {
            if (_writeTimeout) {
                clearTimeout(_writeTimeout);
                _writeTimeout = null;
            }

            if (Object.keys(_pendingWrites).length > 0) {
                var toWrite = _pendingWrites;
                _pendingWrites = {};
                return browser.storage.local.set(toWrite);
            }

            return Promise.resolve();
        },

        /**
         * Direct access to get/set for compatibility with localStorage[key] syntax
         */
        _cache: _cache
    };

    // Create a Proxy to support localStorage[key] syntax (for compatibility)
    var storageProxy = new Proxy(storage, {
        get: function(target, prop) {
            if (prop in target) {
                return target[prop];
            }
            return target.getItem(prop);
        },
        set: function(target, prop, value) {
            if (prop in target) {
                target[prop] = value;
            } else {
                target.setItem(prop, value);
            }
            return true;
        },
        deleteProperty: function(target, prop) {
            target.removeItem(prop);
            return true;
        }
    });

    // Expose to global scope
    e.appStorage = storageProxy;

    // Override localStorage with our wrapper for seamless compatibility
    // This makes all existing localStorage calls use browser.storage.local
    try {
        // Create a localStorage-compatible interface
        Object.defineProperty(e, 'localStorage', {
            get: function() {
                return storageProxy;
            },
            configurable: true
        });
    } catch (err) {
        // If we can't override localStorage, that's okay - appStorage is still available
        console.warn("Could not override localStorage, using appStorage instead");
    }

    // Initialize immediately
    storage.init();

})(this);
