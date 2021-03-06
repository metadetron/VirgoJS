var BiegiModule = (function(){

    var profilePictureUrl = null;
    var profileName = null;
    var sessionToken = null;
    var compiledTemplateCache = {};
    var odcinekCollection = null;
    var views = {
        chartView: null,
        butyTableView: null,
        butyAddView: null,
        butyEditView: null,
        miejsceTableView: null,
        miejsceEditView: null,
        statsView: null,
        biegAddView: null,
        biegiView: null,
        pBSView: null 
    };

    var appEvents = _.extend({}, Backbone.Events);

    var getSessionToken = function() {
        return this.sessionToken;
    }

    $.ajaxSetup({
        data: {'token': getSessionToken }
    });          

    var _sync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        if (model && model.urlRoot) {
            options.url = _.result(model, 'url') + "?token=" + getSessionToken();
        }
        return _sync.call( this, method, model, options );
    }

    ////////////////////////////// M O D E L S ////////////////////////////////////
    var DictionaryModel = Backbone.Model.extend({
        defaults: {
            value: null,
            title: null,
            parentId: null
        },
        initialize: function(){        
        }
    });

    var DictionaryCollection = Backbone.Collection.extend({
        url: function() {
            return 'http://run.metadetron.com/Biegi/dictionary/' + this.entityName + '/';
        },
        model: DictionaryModel,
        initialize: function(entityName) {
            this.entityName = entityName;
        }, 
    });    
    
    var StatsModel = Backbone.Model.extend({
        urlRoot: 'http://run.metadetron.com/Biegi/stats/', 
        defaults: {
            currentDate: null,
            runCount: null,
            lastRun: null,
            totalDistance: null
        },
        initialize: function(){        
        }
    });

    var PBModel = Backbone.Model.extend({
        defaults: {
            location: null,
            track: null,
            time: null
        },
        initialize: function(){        
        }
    });

    var PBCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/pb/',
        model: PBModel 
    });

    var BiegModel = Backbone.Model.extend({
        defaults: {
            bgg_id: null,
            bgg_dzien: null, 
  	        bgg_bty_id: null,
  	        bgg_tmp_id: null,
            bgg_mjs_id: null,
            miejsce: null,
            odc_id: null,
            bgg_opd_id: null,
            bgg_wtr_id: null,
            bgg_rbg_id: null,
            bgg_dystans: null,
            bgg_sekundy: null,
            bgg_opis: null,
            rodzajBiegu: null,
            buty: null,
            wiatr: null,
            temperatura: null,
            opad: null,
            godziny: null,
            minuty: null,
            sekundy: null	
        },
        urlRoot: 'http://run.metadetron.com/Biegi/biegjs/',
        initialize: function(){        
        }
    });

    var BiegCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/biegjs/',
        model: BiegModel 
    });

// usunac wiatr
    var WiatrModel = Backbone.Model.extend({
        defaults: {
            wtr_id: null,
	        wtr_opis: null,
	        wtr_date_created: null,
	        wtr_date_modified: null,
		    wtr_usr_created_id: null,
	        wtr_usr_modified_id: null,
	        wtr_display_order: null
        },
        urlRoot: 'http://run.metadetron.com/Biegi/wiatr/',
        initialize: function(){        
        }
    });

    var WiatrCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/wiatr/',
        model: WiatrModel 
    });
// ------------------     
    var ButyModel = Backbone.Model.extend({
        defaults: {
            bty_id: null,
	        bty_nazwa: null,
	        bty_date_created: null,
	        bty_date_modified: null,
		    bty_usr_created_id: null,
	        bty_usr_modified_id: null
        },
        idAttribute: 'bty_id',
        urlRoot: 'http://run.metadetron.com/Biegi/butyjs/',
    });

    var ButyCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/butyjs/',
        model: ButyModel 
    });

    var MiejsceModel = Backbone.Model.extend({
        defaults: {
            mjs_id: null,
	        mjs_nazwa: null,
	        mjs_date_created: null,
	        mjs_date_modified: null,
		    mjs_usr_created_id: null,
	        mjs_usr_modified_id: null
        },
        idAttribute: 'mjsv_id',
        urlRoot: 'http://run.metadetron.com/Biegi/miejscejs/',
    });

    var MiejsceCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/miejscejs/',
        model: MiejsceModel 
    });
    //////////////////////////////// V I E W S ///////////////////////////////////////

    var DictionarySelectionView = Backbone.View.extend({        
        initialize: function(){
            _.bindAll(this, 'render');
        },        
        render: function(el){
            var that = this;
            // $(el).empty(); 
            _.each(that.model.models, function (dictionaryModel) {
                fillTemplate('dictionarySelect',
                    function (compiledTemplate) {
                        $(el).append(compiledTemplate(dictionaryModel.toJSON()));
                    } 
                );
            }, this);                    
        }
    });

// usunac wiatr
    var WiatrTableView = Backbone.View.extend({
        el: $('#wiatr_table_view'),
        initialize: function(){
            _.bindAll(this, 'render');
            // this.listenTo(this.model, 'sync', this.render);
            this.listenTo(appEvents, 'WiatrEditView:persisted', this.render);
        },        
        render: function(m){
            this.model = m;
            var that = this;
            // $(this.el).empty(); 
            fillTemplate('wiatrTable', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                    $("tbody", that.el).empty();
                    _.each(that.model.models, function (wiatrModel) {
                        fillTemplate('wiatrTableRow', 
                            function (compiledTemplate) {
                                $("tbody", that.el).append(compiledTemplate(wiatrModel.toJSON()));
                            } 
                        );
                    }, that);                    
                } 
            );
        }
    });

    var WiatrEditView = Backbone.View.extend({
        el: $('#page_config #col_left #left_top_1'),
        initialize: function(){
            _.bindAll(this, 'render');
            this.render();
        },        
        render: function(){
            var that = this;
            fillTemplate('wiatrEdit', 
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                } 
            );
        },
        events: {
            "change"        : "change",
             "click .save"   : "persist"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change); //, {validate : true}); bo nie mamy validatorow indywidualnych w modelu jeszcze(?)
        },
        persist: function (event) {
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    var wiatrCollection = new WiatrCollection('wiatr'); 
                    wiatrCollection.fetch(
                        {
                            success: function() {
                                // appRouter.navigate("config", {trigger: true});
                                appEvents.trigger('WiatrEditView:persisted'); // model.sync event???                                
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );            
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
    });
// ------------------------

    var ButyTableView = Backbone.View.extend({
        el: $('#buty_table_view'),
        initialize: function(){
            _.bindAll(this, 'render');
            this.listenTo(appEvents, 'ButyEditView:persisted', this.reread);
            this.listenTo(appEvents, 'ButyAddView:persisted', this.reread);
            this.listenTo(appEvents, 'ButyTableView:deleted', this.reread);
        },        
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('butyTable', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                    $("tbody", that.el).empty();
                    _.each(that.model.models, function (butyModel) {
                        fillTemplate('butyTableRow', 
                            function (compiledTemplate) {
                                $("tbody", that.el).append(compiledTemplate(butyModel.toJSON()));
                                that.delegateEvents();
                            } 
                        );
                    }, that);                    
                } 
            );
        },
        reread: function() {
            var butyCollection = new ButyCollection();
            var that = this; 
            butyCollection.fetch(
                {
                    success: function() {
                        that.render(butyCollection);
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );            
        },
        events: {
             "click .edit"   : "edit",
             "click .delete"   : "delete",
             "click .add"   : "add"
        },                
        edit: function(event) {            
            $(".config_panel").hide();
//            views.butyTableView.undelegateEvents(); // WHAAAAAA???
            var buty = new ButyModel({bty_id: event.currentTarget.dataset.id});
            buty.fetch(
                {
                    success: function() {
                        views.butyEditView.render(buty);
                        $("#page_config #buty_edit_view").show();
                        $('#page_config #buty_edit_view input[autofocus]').get(0).focus();                        
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
            event.preventDefault();
        },
        add: function(event) {            
            // TODO sprawdz zmiany
            $(".config_panel").hide();
            var buty = new ButyModel();
            views.butyAddView.render(buty);
            $("#page_config #buty_add_view").show();
            $('#page_config #buty_add_view input[autofocus]').get(0).focus();                        
            event.preventDefault(); 
        },
        delete: function(event) {
            new ConfirmationView({model: {question: "Na pewno chcesz usunąć buty '" + event.currentTarget.dataset.title + "'?", yesFunction: this.delete_confirmed, event: event}});
        },
        delete_confirmed: function(event) {
            var that = this;
            var buty = new ButyModel({bty_id: event.currentTarget.dataset.id});
            buty.destroy(
                {
                    success: function() {
                        new InfoView({model: {message: "Buty usunięte"}});
                        appEvents.trigger('ButyTableView:deleted');
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
            event.preventDefault();            
        }
    });

    var ButyAddView = Backbone.View.extend({
        el: $('#buty_add_view'),
        initialize: function(){
            _.bindAll(this, 'render');
        },        
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('butyAdd', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    that.delegateEvents();
                } 
            );
        },
        events: {
            "change"        : "change",
             "click .save"   : "persist",
             "click .cancel"   : "cancel"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
        },
        persist: function (event) {            
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    new InfoView({model: {message: "Buty dodane"}});
                    appEvents.trigger('ButyAddView:persisted');
                    $(".config_panel").hide();
                    $("#page_config #buty_table_view").show(); 
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
        cancel: function(event) {            
            // TODO sprawdz zmiany
            $(".config_panel").hide();
            $("#page_config #buty_table_view").show(); 
            event.preventDefault(); 
        }
    });

    var ButyEditView = Backbone.View.extend({
        el: $('#buty_edit_view'),
        initialize: function(){
            _.bindAll(this, 'render');
        },        
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('butyEdit', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    that.delegateEvents();
                } 
            );
        },
        events: {
            "change"        : "change",
             "click .save"   : "persist",
             "click .cancel"   : "cancel"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
        },
        persist: function (event) {            
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    new InfoView({model: {message: "Buty zmienione"}});
                    appEvents.trigger('ButyEditView:persisted');
                    $(".config_panel").hide();
                    $("#page_config #buty_table_view").show(); 
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
        cancel: function(event) {            
            // TODO sprawdz zmiany
            $(".config_panel").hide();
            $("#page_config #buty_table_view").show(); 
            event.preventDefault(); 
        }
    });

    var MiejsceTableView = Backbone.View.extend({
        el: $('#miejsce_table_view'),
        initialize: function(){
            _.bindAll(this, 'render');
            this.listenTo(appEvents, 'MiejsceEditView:persisted', this.reread);
            this.listenTo(appEvents, 'MiejsceAddView:persisted', this.reread);
            this.listenTo(appEvents, 'MiejsceTableView:deleted', this.reread);
        },        
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('miejsceTable', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                    $("tbody", that.el).empty();
                    _.each(that.model.models, function (butyModel) {
                        fillTemplate('miejsceTableRow', 
                            function (compiledTemplate) {
                                $("tbody", that.el).append(compiledTemplate(butyModel.toJSON()));
                                that.delegateEvents();
                            } 
                        );
                    }, that);                    
                } 
            );
        },
        reread: function() {
            var miejsceCollection = new MiejsceCollection();
            var that = this; 
            miejsceCollection.fetch(
                {
                    success: function() {
                        that.render(miejsceCollection);
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );            
        },
        events: {
             "click .edit"   : "edit",
             "click .delete"   : "delete",
             "click .add"   : "add"
        },                
        edit: function(event) {            
            $(".config_panel").hide();
            var miejsce = new MiejsceModel({mjs_id: event.currentTarget.dataset.id});
            miejsce.fetch(
                {
                    success: function() {
                        views.miejsceEditView.render(miejsce);
                        $("#page_config #miejsce_edit_view").show();
                        $('#page_config #miejsce_edit_view input[autofocus]').get(0).focus();                        
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
            event.preventDefault();
        },
        add: function(event) {            
            // TODO sprawdz zmiany
            $(".config_panel").hide();
            var miejsce = new MiejsceModel();
            views.miejsceAddView.render(miejsce);
            $("#page_config #miejsce_add_view").show();
            $('#page_config #miejsce_add_view input[autofocus]').get(0).focus();                        
            event.preventDefault(); 
        },
        delete: function(event) {
            new ConfirmationView({model: {question: "Na pewno chcesz usunąć miejsce '" + event.currentTarget.dataset.title + "'?", yesFunction: this.delete_confirmed, event: event}});
        },
        delete_confirmed: function(event) {
            var that = this;
            var miejsce = new miejsceModel({mjs_id: event.currentTarget.dataset.id});
            miejsce.destroy(
                {
                    success: function() {
                        new InfoView({model: {message: "Miejsce usunięte"}});
                        appEvents.trigger('MiejsceTableView:deleted');
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
            event.preventDefault();            
        }
    });    

    var MiejsceEditView = Backbone.View.extend({
        el: $('#miejsce_edit_view'),
        initialize: function(){
            _.bindAll(this, 'render');
        },        
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('miejsceEdit', 
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    that.delegateEvents();
                } 
            );
        },
        events: {
            "change"        : "change",
             "click .save"   : "persist",
             "click .cancel"   : "cancel"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
        },
        persist: function (event) {            
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    new InfoView({model: {message: "Miejsce zmienione"}});
                    appEvents.trigger('MiejsceEditView:persisted');
                    $(".config_panel").hide();
                    $("#page_config #miejsce_table_view").show(); 
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
        cancel: function(event) {            
            // TODO sprawdz zmiany
            $(".config_panel").hide();
            $("#page_config #miejsce_table_view").show(); 
            event.preventDefault(); 
        }
    });

    var ErrorView = Backbone.View.extend({
        el: $('#error'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var compiledTemplate = _.template('<div class="alert alert-danger" role="alert"><%= responseText %> <%= statusText %></div>');
            $("div.modal-body", this.el).html(compiledTemplate(this.model));
            $(this.el).modal();
        },        
    });

    var InfoView = Backbone.View.extend({
        el: $('#info'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var compiledTemplate = _.template('<div class="alert alert-success" role="alert"><%= message %></div>');
            $("div.modal-body", this.el).html(compiledTemplate(this.model));
            $(this.el).modal();
        },        
    });

    var ConfirmationView = Backbone.View.extend({
        el: $('#confirm'),
        initialize: function() {
            _.bindAll(this, 'render');
            this.render();
        },
        render: function() {
            var compiledTemplate = _.template('<div class="alert alert-warning" role="alert"><%= question %></div>');
            $("div.modal-body", this.el).html(compiledTemplate(this.model));
            $(this.el).modal();            
        },
        events: {
            'click .yes':'yes',
            'click .no':'no'
        },
        yes: function(){
             this.model.yesFunction(this.model.event);
             $(this.el).modal('hide');
        },
        no: function(e){
            $(this.el).modal('hide');
        }
    });

    var ChartView = Backbone.View.extend({
        el: $('#chart_view'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.listenTo(appEvents, 'BiegAddView:persisted', this.render);
        },
        render: function(){
            var that = this;
            fillTemplate('chart',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                } 
            );            
            google.charts.load('current', {packages: ['corechart', 'bar']});
            google.charts.setOnLoadCallback(drawAxisTickColors);

            function drawAxisTickColors() {
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Month');
                data.addColumn('number', 'Distance');
                var options = {
                    title: 'Distance per month'
                };
                // wywolaj api pobierajace liste danych
                $.ajax({
                    url: "http://run.metadetron.com/Biegi/month/"
                }).then(function(months) {
                    data.addRows(months);
                    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                });
            }
        }
    });

    // definicja widoku
    var StatsView = Backbone.View.extend({
        el: $('#stats_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('stats',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    $("#profilePhoto").attr("src", profilePictureUrl);
                    $("#fullName").text(profileName);                                
                } 
            );
        }
    });

    // definicja widoku
    var PBView = Backbone.View.extend({
        el: null, // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(elem){
            var that = this;
            fillTemplate('pb',
                function (compiledTemplate) {
                    elem.append(compiledTemplate(that.model.toJSON()));
                } 
            );
        }
    });

    var PBSView = Backbone.View.extend({
        el: $('#page_dashboard #col_right #right_top_1'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('pbs',
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                    _.each(that.model.models, function (pbModel) {
                        new PBView({model: pbModel}).render($('tbody.body#pbs'));
                    }, this);                    
                } 
            );
        }
    });

    var BiegView = Backbone.View.extend({
        el: null, // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(elem){
            var that = this;
            fillTemplate('bieg',
                function (compiledTemplate) {
                    elem.append(compiledTemplate(that.model.toJSON()));
                } 
            );
        }
    });    

    var BiegiView = Backbone.View.extend({
        el: $('#biegi_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.listenTo(appEvents, 'BiegAddView:persisted', this.reread);
        },
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('biegi',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                    _.each(that.model.models, function (biegModel) {
                        new BiegView({model: biegModel}).render($('div#biegi'));
                    }, this);
                } 
            );
        },
        reread: function() {
            var biegCollection = new BiegCollection();
            biegCollection.fetch(
                {
                    success: function() {
                        views.biegiView.render(biegCollection);
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
        }
    });

    var BiegDetailsView = Backbone.View.extend({
        el: $("#modalDialog"), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this"
            this.render(); 
        },
        render: function(){
            var that = this;
            fillTemplate('biegDetails',
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                    $('#myModal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                } 
            );
        }
    });    

    var BiegAddView = Backbone.View.extend({
        el: $('#bieg_add_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(){
            var that = this;
            this.model = new BiegModel({bgg_dzien: utc = new Date().toJSON().slice(0,10)});
            fillTemplate('biegAdd',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    var miejsceCollection = new DictionaryCollection('miejsce'); 
                    miejsceCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: miejsceCollection}).render($("#bgg_mjs_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    odcinekCollection = new DictionaryCollection('odcinek'); 
                    odcinekCollection.fetch(
                        {
                            success: function() {
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );                        
                    var temperaturaCollection = new DictionaryCollection('temperatura'); 
                    temperaturaCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: temperaturaCollection}).render($("#bgg_tmp_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var butyCollection = new DictionaryCollection('buty'); 
                    butyCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: butyCollection}).render($("#bgg_bty_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var opadCollection = new DictionaryCollection('opad'); 
                    opadCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: opadCollection}).render($("#bgg_opd_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var wiatrCollection = new DictionaryCollection('wiatr'); 
                    wiatrCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: wiatrCollection}).render($("#bgg_wtr_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var rodzajBieguCollection = new DictionaryCollection('rodzajBiegu'); 
                    rodzajBieguCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: rodzajBieguCollection}).render($("#bgg_rbg_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                } 
            );
        },
        events: {
            "change"        : "change",
            "change #bgg_mjs_id": "miejsceSelected",
             "click .save"   : "persist"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change); //, {validate : true}); bo nie mamy validatorow indywidualnych w modelu jeszcze(?)
        },
        persist: function (event) {
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    appEvents.trigger('BiegAddView:persisted');
                    self.render();
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
        miejsceSelected: function(event) {
            var filteredOdcinekCollection = new Backbone.Collection(odcinekCollection.filter(function (odcinek) {
                if (odcinek.get('parentId') == null) return true;
                return odcinek.get('parentId') == event.target.value;
            }));
            new DictionarySelectionView({model: filteredOdcinekCollection}).render($("#odc_id").first());
        }
    });

    var app = this;

    //////////////////////////////// R O U T E R ////////////////////////////////////
    var AppRouter = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "login",
            "dashboard": "dashboard",
            "config-miejsce": "configMiejsce",
            "config-buty": "configButy",
            "biegi/details/:id": "biegDetails",
            "buty/edit/:id": "butyEdit"
        },
        login: function() {
            $(".backbone_page").hide();
            $("#page_login.backbone_page").show();
        },
        dashboard: function() {
            $(".backbone_page").hide();
            $("#page_dashboard.backbone_page").show();
        },
        biegDetails: function(id) {
            var bieg = new BiegModel({id: id});
            bieg.fetch(
                {
                    success: function() {
                        new BiegDetailsView({model: bieg});
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
        },
        configButy: function() {
            $(".backbone_page").hide();
            $("#page_config.backbone_page").show();
            $(".config_panel").hide();
            $("#page_config #buty_table_view").show();
        },
        configMiejsce: function() {
            $(".backbone_page").hide();
            $("#page_config.backbone_page").show();
            $(".config_panel").hide();
            $("#page_config #miejsce_table_view").show();
        }       
    });
    views.chartView = new ChartView();
    views.butyTableView = new ButyTableView();
    views.butyAddView = new ButyAddView();
    views.butyEditView = new ButyEditView();
    views.miejsceTableView = new MiejsceTableView();
    views.miejsceEditView = new MiejsceEditView();
    views.statsView = new StatsView(); 
    views.biegAddView = new BiegAddView({model: new BiegModel()});
    views.biegiView = new BiegiView();
    views.pBSView = new PBSView();

    var appRouter = new AppRouter();
    Backbone.history.start();

    /////////////////////////// U T I L S //////////////////////////
    function fillTemplate(templateId, callback) {
        if (!(templateId in compiledTemplateCache)) {
            var data = $('script#' + templateId).html();
            var compiledTemplate = _.template(data);
            compiledTemplateCache[templateId] = compiledTemplate;
            fillTemplate(templateId, callback);
            return;         
        }
        callback(compiledTemplateCache[templateId]);
    }

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        var authResponse = googleUser.getAuthResponse();
        profilePictureUrl = profile.getImageUrl();
        profileName = profile.getName();
        this.sessionToken = authResponse.id_token;
        $("button#logout").show();

        views.chartView.render();
        var stats = new StatsModel({id: 0});
        stats.fetch(
            {
                success: function() {
                    views.statsView.render(stats);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );
        views.biegAddView.render();
        var biegCollection = new BiegCollection();
        biegCollection.fetch(
            {
                success: function() {
                    views.biegiView.render(biegCollection);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );
        var pbCollection = new PBCollection();
        pbCollection.fetch(
            {
                success: function() {
                    views.pBSView.render(pbCollection);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );
        var butyCollection = new ButyCollection();
        var that = this; 
        butyCollection.fetch(
            {
                success: function() {
                    views.butyTableView.render(butyCollection);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );            

        var miejsceCollection = new MiejsceCollection()
        var that = this; 
        miejsceCollection.fetch(
            {
                success: function() {
                    views.miejsceTableView.render(miejsceCollection);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );            

        appRouter.navigate("dashboard", {trigger: true}); // raczej ma byc: appRouter.dashboard(); ?
    };

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        var that = this;
        auth2.signOut().then(function () {
            console.log('User signed out.');
            that.sessionToken = null;
            $("button#logout").hide();
            appRouter.navigate("login", {trigger: true});
        });
    };

    return {
        signOut: signOut,
        onSignIn: onSignIn
    };
}());

// for google data-onsuccess :-/
window.onSignIn = BiegiModule.onSignIn;
window.signOut = BiegiModule.signOut;

$(".nav a").on("click", function(){
   $(".nav").find(".active").removeClass("active");
   $(this).parent().addClass("active");
});