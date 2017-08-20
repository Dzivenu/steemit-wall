const events = new Vue({});

var app = new Vue({
  el: '#app',
  data: {
    username: '',
    account: null,
    showUser: false,
    columns: [],
    addNewTag: null,
    addHotTag: null,
    addTrendingTag: null,
    addBlogUser: null,
    addFeedUser: null,
  },
  created: function() {
    events.$on('delete-column', (index) => {
      this.columns.splice(index, 1);
    });
  },
  methods: {
    lookupUsername: function () {
      steem.api.getAccounts([this.username], (err, accounts) => {
        this.account = null;
        if (accounts.length) {
          this.account = accounts[0];
          this.account.profile = JSON.parse(this.account.json_metadata).profile;
        }
      });
    },
    submitUser: function (e) {
      e.preventDefault();
      if (this.account) {
        this.showUser = true;
      }
      return false;
    },
    addColumn: function (type, e) {
      e.preventDefault();
      UIkit.modal("#add-column-modal").hide();
      switch (type) {
        case 'new':
          this.columns.push({type: 'new', id: this.addNewTag});
          break;
        case 'hot':
          this.columns.push({type: 'hot', id: this.addHotTag});
          break;
        case 'trending':
          this.columns.push({type: 'trending', id: this.addTrendingTag});
          break;
        case 'blog':
          this.columns.push({type: 'blog', id: this.addBlogUser});
          break;
        case 'feed':
          this.columns.push({type: 'feed', id: this.addFeedUser});
          break;
      }
      this.columnClass = this.columns.length;
    }
  },
  components: {
    'app-column': {
      template: '#app-column-template',
      props: ['type', 'id', 'index', 'columnsCount'],
      methods: {
        deleteColumn: function() {
          events.$emit('delete-column', this.index);
        }
      },
      data: function () {
        return {
          posts: [],
          limit: 20
        };
      },
      created: function () {
        switch (this.type) {
          case 'new':
            steem.api.getDiscussionsByCreated({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByCreated({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 10000);
            break;
          case 'hot':
            steem.api.getDiscussionsByHot({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByHot({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 10000);
            break;
          case 'trending':
            steem.api.getDiscussionsByTrending({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByTrending({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 10000);
            break;
          case 'blog':
            steem.api.getDiscussionsByBlog({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByBlog({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 10000);
            break;
          case 'feed':
            steem.api.getDiscussionsByFeed({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByFeed({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 10000);
            break;
        }
      },
      components: {
        'app-post': {
          template: '#app-post-template',
          props: ['post', 'meta'],
          methods: {
            getDate() {
              return moment.utc(new Date(this.post.created)).from(moment.utc().format('YYYY-MM-DD HH:mm:ss'))
            },
            getPayout: function() {
              if (this.post.last_payout == '1970-01-01T00:00:00') {
                var payout = this.post.pending_payout_value.replace(' SBD', '');
                return parseFloat(payout).toFixed(2);
              }

              var authorPayout = this.post.total_payout_value.replace(' SBD', '');
              var curatorPayout = this.post.curator_payout_value.replace(' SBD', '');

              return (parseFloat(authorPayout) + parseFloat(curatorPayout)).toFixed(2);
            }
          }
        }
      }
    },
  }
});
