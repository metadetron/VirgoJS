// UWAGA! Ta wersja jeszcze nie keszuje templateow!
// I nie chowa kodu w module

var BiegiModule = (function(){
    var profilePictureUrl = null;
    var profileName = null;
    var compiledTemplateCache = {};

    ////////////////////////////// M O D E L S ////////////////////////////////////
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
            miejsce: null,
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
            opad: null	
        },
        urlRoot: 'http://run.metadetron.com/Biegi/biegjs/',
        initialize: function(){        
        }
    });

    var BiegCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/biegjs/',
        model: BiegModel 
    });

    //////////////////////////////// V I E W S ///////////////////////////////////////
    var LogInView = Backbone.View.extend({
        el: $('#col_middle #top_1'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            console.log("Rendering LogInView...");
            $('#login').show();
            $('#logout').hide();
            var that = this;
            fillTemplate('login',
                function (compiledTemplate) {
                    $('#col_left').empty();
                    $('#col_right').empty();
                    $('#col_middle #top_2').empty();
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                } 
            );            
        }
    });

    var ErrorView = Backbone.View.extend({
        el: $('#error'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var compiledTemplate = _.template('<div class="alert alert-danger" role="alert"><%= responseText %></div>');
            $(this.el).empty();
            $(this.el).append(compiledTemplate(this.model));
        }
    });

    var ChartView = Backbone.View.extend({
        el: $('#col_middle #top_1'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var that = this;
            fillTemplate('chart',
                function (compiledTemplate) {
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate());
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
        el: $('#col_left'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            var that = this;
            fillTemplate('stats',
                function (compiledTemplate) {
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
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
        el: $('#col_right'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            var that = this;
            fillTemplate('pbs',
                function (compiledTemplate) {
                    $(that.el).empty();
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
        el: $('#col_middle #top_2'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            var that = this;
            fillTemplate('biegi',
                function (compiledTemplate) {
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                    _.each(that.model.models, function (biegModel) {
                        new BiegView({model: biegModel}).render($('div#biegi'));
                    }, this);
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
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                    $('#myModal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                } 
            );
        }
    });    

    //////////////////////////////// R O U T E R ////////////////////////////////////
    var AppRouter = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "dashboard",
            "dashboard": "dashboard",
            "biegi/details/:id": "biegDetails"
        },
        login: function() {
            new LogInView();
        },
        dashboard: function() {
            console.log("dashboard called");
            $.ajax({
                url: "http://run.metadetron.com/Biegi/auth"
            }).then(function(data) {    
                $('#login').hide();
                $('#logout').show();
                $('#myModal').modal('hide');
                new ChartView();
                var stats = new StatsModel({id: 0});
                stats.fetch(
                    {
                        success: function() {
                            new StatsView({model: stats});
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
                            new PBSView({model: pbCollection});
                        },
                        error: function(collection, response, options) {
                            new ErrorView({model: response});
                        }
                    }
                );
                var biegCollection = new BiegCollection();
                biegCollection.fetch(
                    {
                        success: function() {
                            new BiegiView({model: biegCollection});
                        },
                        error: function(collection, response, options) {
                            new ErrorView({model: response});
                        }
                    }
                );
            }, function(data) {
                signOut();
            });
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
        }        
    });
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
        console.log(profile);
        var authResponse = googleUser.getAuthResponse();
        console.log(authResponse);
        $.post("http://run.metadetron.com/Biegi/auth", { google_id: authResponse.id_token}).done(function( data ) {
            console.log(data);
            appRouter.navigate("dashboard", {trigger: true});
            profilePictureUrl = profile.getImageUrl();
            profileName = profile.getName();
        });
    };

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out.');
            $.ajax({
                url: "http://run.metadetron.com/Biegi/auth/0",
                type: 'DELETE',
                success: function(result) {
                    appRouter.navigate("login", {trigger: true});
                }
            });            
        });
    };

    return {
        signOut: signOut,
        onSignIn: onSignIn
    };
}());

// for google data-onsuccess :-/
window.onSignIn = BiegiModule.onSignIn;

