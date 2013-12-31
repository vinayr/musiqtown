import cgi
import webapp2
import logging
from google.appengine.ext import db

class MainPage(webapp2.RequestHandler):
    def get(self):
        f = open('index.html', 'r')
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write(f.read());
		
class ToLisnDB(db.Model):
	data = db.StringProperty(required=True)

class ToLisn(webapp2.RequestHandler):
    def post(self):
		action = cgi.escape(self.request.get('action'))
		if(action == "add"):
			add_content = cgi.escape(self.request.get('content'))
			#logging.info("adding data: %s", add_content)
			a = ToLisnDB(data=add_content)
			a.put()
		elif(action == "delete"):
			del_content = cgi.escape(self.request.get('content'))
			#logging.info("delete data: %s", del_content)
			d = db.Query(ToLisnDB)
			results = d.filter('data =', del_content)
			for r in results:
				r.delete()
		elif(action == "list"):
			list = db.Query(ToLisnDB)
			#results = q.filter('data =', del_content)
			for res in list:
				self.response.out.write(res.data + '\n')
		
application = webapp2.WSGIApplication([
    ('/', MainPage),
	('/tolisn', ToLisn)
], debug=True)
