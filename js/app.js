window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const controller = new ns.controller.GameController();
  controller.init();
  ns.app = { controller };
})(window.GiocoTastiera);
