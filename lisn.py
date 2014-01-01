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
	
class SongDB(db.Model):
	name = db.StringProperty()
	url = db.StringProperty()
	length = db.StringProperty()
	tags = db.ListProperty(str)

class Songs(webapp2.RequestHandler):
    def post(self):
		action = cgi.escape(self.request.get('action'))
		if(action == "list"):
			tag = cgi.escape(self.request.get('tag'))
			if(tag == "all"):
				results = db.Query(SongDB)
				for res in results:
					self.response.write(res.name+'\n'+res.url+'\n'+res.length+'\n'+":".join(res.tags)+'\r')
			else:
				d = db.Query(SongDB)
				results = d.filter('tags =', tag)
				for res in results:
					self.response.write(res.name+'\n'+res.url+'\n'+res.length+'\n'+":".join(res.tags)+'\r')
					
		elif(action == "delete"):
			url = cgi.escape(self.request.get('url'))
			# logging.info("delete url: %s", url)
			d = db.Query(SongDB)
			results = d.filter('url =', url)
			for r in results:
				r.delete()

		
class Tag(webapp2.RequestHandler):
    def post(self):
		action = cgi.escape(self.request.get('action'))
		if(action == "add"):
			song_name = cgi.escape(self.request.get('song_name'))
			song_url = cgi.escape(self.request.get('song_url'))
			song_length = cgi.escape(self.request.get('song_length'))
			song_tag = self.request.get_all('song_tag[]')
			# logging.info("song_name: %s", song_name)
			# logging.info("song_url: %s", song_url)
			# logging.info("song_length: %s", song_length)
			# logging.info("song_tag: %s", song_tag)
			d = db.Query(SongDB)
			results = d.filter('url =', song_url)
			if results.count(limit=1):
				for r in results:
					if len(set(song_tag).intersection(r.tags)) > 0:
						# logging.info("already tagged")
						break
				else: #this is for loop's else
					r.tags.extend(song_tag)
					r.put()
			else:
				s = SongDB()
				s.name = song_name
				s.url = song_url
				s.length = song_length
				s.tags = song_tag
				s.put()
				
		elif(action == "list"):
			if self.request.get('tag') == "all":
				list = []
				taglist = db.GqlQuery("SELECT DISTINCT tags FROM SongDB")
				for t in taglist:
					list.extend(t.tags)
				res = ":".join(list)
				self.response.write(res)

			
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
			for res in list:
				self.response.write(res.data + '\n')
		
application = webapp2.WSGIApplication([
    ('/', MainPage),
	('/songs', Songs),
	('/tag', Tag),
	('/tolisn', ToLisn)
], debug=True)
