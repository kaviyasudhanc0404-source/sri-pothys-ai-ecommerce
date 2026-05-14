(function () {
  var externalNoisePatterns = [
    "Service is currently unstable",
    "A listener indicated an asynchronous response by returning true",
    "message channel closed before a response was received",
    "runtime.lastError",
  ];

  var extensionRequestPrefixes = [
    "/generate",
    "/site_integrate",
    "/site_integration",
    "/writing",
  ];

  function getMessage(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value.message) return String(value.message);
    if (value.errMsg) return String(value.errMsg);
    try {
      return JSON.stringify(value);
    } catch (error) {
      return "";
    }
  }

  function getPathPrefix(value) {
    return value && value.reqInfo && typeof value.reqInfo.pathPrefix === "string"
      ? value.reqInfo.pathPrefix
      : "";
  }

  function isExtensionPermissionError(value) {
    if (!value || typeof value !== "object") return false;

    var message = getMessage(value).toLowerCase();
    var dataMessage = value.data && value.data.msg ? String(value.data.msg).toLowerCase() : "";
    var pathPrefix = getPathPrefix(value);

    return (
      value.code === 403 &&
      (message === "permission error" || dataMessage === "permission error") &&
      extensionRequestPrefixes.indexOf(pathPrefix) !== -1
    );
  }

  function isKnownExternalNoise(value) {
    var message = getMessage(value);
    var hasKnownMessage = externalNoisePatterns.some(function (pattern) {
      return message.indexOf(pattern) !== -1;
    });
    return hasKnownMessage || isExtensionPermissionError(value) || (value && value.errNo === -2 && value.errMsg);
  }

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      if (isKnownExternalNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    "error",
    function (event) {
      if (isKnownExternalNoise(event.error) || isKnownExternalNoise(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
})();
