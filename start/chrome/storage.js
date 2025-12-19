/**
 * Storage wrapper that uses browser.storage.local with in-memory caching
 * This works in Firefox private browsing mode unlike localStorage
 * 
 * OPTIMIZED: Reads from localStorage first for fast initial load,
 * then syncs from browser.storage.local for private mode support
 */
(function(e) {
    "use strict";

    // In-memory cache for synchronous access
    var _cache = {};
    var _initialized = false;
    var _isPrivateMode = false;
    var _pendingWrites = {};
    var _writeTimeout = null;

    // Detect private mode by trying to use localStorage
    try {
        localStorage.setItem('__test__', '1');
        localStorage.removeItem('__test__');
        _isPrivateMode = false;
    } catch (err) {
        _isPrivateMode = true;
    }

    // FAST PATH: Pre-populate cache from localStorage immediately (synchronous)
    if (!_isPrivateMode) {
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                _cache[key] = localStorage.getItem(key);
            }
            _initialized = true; // Ready immediately!
        } catch (err) {
            // localStorage failed, we're likely in private mode
            _isPrivateMode = true;
        }
    }

    var storage = {
        /**
         * Initialize storage - only needed for private mode
         * In normal mode, cache is already populated from localStorage
         */
        init: function() {
            if (_initialized && !_isPrivateMode) {
                return Promise.resolve();
            }

            return new Promise(function(resolve) {
                browser.storage.local.get(null).then(function(data) {
                    if (data && Object.keys(data).length > 0) {
                        _cache = data;
                    }
                    _initialized = true;
                    resolve();
                }).catch(function(err) {
                    console.error("Storage init error:", err);
                    _initialized = true;
                    resolve();
                });
            });
        },

        /**
         * Check if storage is initialized
         */
        isReady: function() {
            return _initialized;
        },

        /**
         * Check if in private browsing mode
         */
        isPrivateMode: function() {
            return _isPrivateMode;
        },

        /**
         * Get a value from cache (synchronous)
         */
        getItem: function(key) {
            // Fast path: return from cache
            if (_cache.hasOwnProperty(key)) {
                return _cache[key];
            }
            
            // Fallback to localStorage if not in cache (and not private mode)
            if (!_isPrivateMode) {
                try {
                    var value = localStorage.getItem(key);
                    if (value !== null) {
                        _cache[key] = value;
                    }
                    return value;
                } catch (e) {
                    return null;
                }
            }
            
            return null;
        },

        /**
         * Set a value in cache and queue for async write (synchronous API)
         */
        setItem: function(key, value) {
            _cache[key] = value;

            // Write to localStorage immediately (fast, synchronous)
            if (!_isPrivateMode) {
                try {
                    localStorage.setItem(key, value);
                } catch (e) {
                    // localStorage full or unavailable
                }
            }

            // Queue for async write to browser.storage.local
            _pendingWrites[key] = value;
            storage._scheduleWrite();
        },

        /**
         * Remove a value from cache and storage
         */
        removeItem: function(key) {
            delete _cache[key];

            if (!_isPrivateMode) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {}
            }

            browser.storage.local.remove(key).catch(function(err) {
                console.error("Storage remove error:", err);
            });
        },

        /**
         * Clear all storage
         */
        clear: function() {
            _cache = {};

            if (!_isPrivateMode) {
                try {
                    localStorage.clear();
                } catch (e) {}
            }

            browser.storage.local.clear().catch(function(err) {
                console.error("Storage clear error:", err);
            });
        },

        /**
         * Get all keys in storage
         */
        keys: function() {
            return Object.keys(_cache);
        },

        /**
         * Get the number of items in storage
         */
        get length() {
            return Object.keys(_cache).length;
        },

        /**
         * Get a key by index
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
                    });
                }
            }, 250); // Debounce writes by 250ms
        },

        /**
         * Force immediate write of all pending changes
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
        }
    };

    // Create a Proxy for localStorage[key] syntax compatibility
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

    // In private mode, initialize from browser.storage.local
    if (_isPrivateMode) {
        storage.init();
    }

})(this);
