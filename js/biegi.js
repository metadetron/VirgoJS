// co tu sie dzieje sie?
(function($){
    // definicja widoku
    var LorumView = Backbone.View.extend({
        el: $('#col_left'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            $.get('tpl/portlet.html', 
                function(data) {
                    $(this.el).append( _.template(data));
                }, 
                'html');
        }
    });
    new LorumView();
})(jQuery);