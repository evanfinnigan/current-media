


function add_to_cart() {
  if (!supports_html5_storage()) { return false; }
  // localStorage["key"] = value;
  return true;
}



function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] != null;
  } catch (e) {
    return false;
  }
}