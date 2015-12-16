this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

    Template.editor.helpers({
        docid:function(){
            var doc = Documents.findOne();
            if(doc){
                return doc._id;
            } else {
                return undefined;
            }
        },
        config:function(){
            return function(editor){
                editor.setOption("lineNumbers", true);
                editor.setOption("mode", "html");
                editor.on("change", function(cm_editor, info){
                    //console.log(cm_editor.getValue());
                    $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                    Meteor.call("addEditingUser");
                });
                //console.log(editor);
            }
        }
    });

    Template.editingUsers.helpers({
        users:function(){
            var doc, eusers, users;
            doc = Documents.findOne();
            if(!doc){ return; } //give up
            eusers = EditingUsers.findOne({docid:doc._id});
            if(!users){return;}
            for (var user_id in eusers.users){
                users[i] = eusers.user[user_id];
                i++;
            }

            return users;
        }
    });
}
//end client

if (Meteor.isServer) {
  Meteor.startup(function () {
    if(!Documents.findOne()){
       Documents.insert({title:"my new document"});
    }
  });
}

Meteor.methods({
    addEditingUser: function(){
        var doc, user, eusers;
        doc = Documents.findOne();
        if(!doc){return;}
        if(!this.userId){return;}
        user = Meteor.user().profile;
        eusers = EditingUsers.findOne({docid:doc._id});
        if(!eusers){
            eusers ={
                docid:doc._id,
            };
        }
        EditingUsers.upsert({_id:eusers._id}, eusers);
    }
});
