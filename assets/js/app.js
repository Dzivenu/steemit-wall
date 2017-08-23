const events = new Vue({});

var app = new Vue({
  el: '#app',
  data: {
    username: '',
    account: null,
    showUser: false,
    userUpdateRun: null,
    columns: [],
    addNewTag: null,
    addHotTag: null,
    addTrendingTag: null,
    addBlogUser: null,
    addFeedUser: null
  },
  created: function() {
    this.username = loadFromLocalStorage('username');
    if (this.username) {
      this.lookupUsername();
      this.showUser = true;
    }

    if (loadFromLocalStorage('columns')) {
      this.columns = loadFromLocalStorage('columns');
    }

    events.$on('delete-column', (index) => {
      this.columns.splice(index, 1);
      saveToLocalStorage('columns', this.columns);
    });
  },
  methods: {
    lookupUsername: function () {
      if (this.username) {
        steem.api.getAccounts([this.username], (err, accounts) => {
          this.account = null;
          clearInterval(this.userUpdateRun);
          if (accounts.length) {
            steem.api.getFollowCount(this.username, (err, followers) => {
              this.account = accounts[0];
              this.account.profile = JSON.parse(this.account.json_metadata).profile;
              this.account.followers = followers;
              this.userUpdateRun = setInterval(this.userUpdate, 15000);
            });
          }
        });
      }
    },
    userUpdate: function () {
      steem.api.getAccounts([this.username], (err, accounts) => {
        if (accounts.length) {
          steem.api.getFollowCount(this.username, (err, followers) => {
            this.account = accounts[0];
            this.account.profile = JSON.parse(this.account.json_metadata).profile;
            this.account.followers = followers;
          });
        }
      });
    },
    submitUser: function (e) {
      e.preventDefault();
      if (this.account) {
        this.showUser = true;
        saveToLocalStorage('username', this.username);
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
      saveToLocalStorage('columns', this.columns);
    }
  },
  computed: {
    votingPower: function() {
      var secondsPassedSinceLastVote = (new Date - new Date(this.account.last_vote_time + "Z")) / 1000,
          votingPower = this.account.voting_power;
      votingPower += (10000 * secondsPassedSinceLastVote / 432000);

      return Math.min(votingPower / 100, 100).toFixed(2);
    },
    reputation: function() {
      return calculateSteemitUserReputation(this.account.reputation, 1);
    }
  },
  components: {
    'app-column': {
      template: '#app-column-template',
      props: ['type', 'id', 'index', 'columnsCount'],
      methods: {
        deleteColumn: function() {
          events.$emit('delete-column', this.index);
        },
        typeLabel: function() {
          return this.type.substr(0, 1).toUpperCase() + this.type.substr(1);
        }
      },
      data: function () {
        return {
          posts: [],
          limit: 10
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
            }, 15000);
            break;
          case 'hot':
            steem.api.getDiscussionsByHot({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByHot({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 15000);
            break;
          case 'trending':
            steem.api.getDiscussionsByTrending({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByTrending({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 15000);
            break;
          case 'blog':
            steem.api.getDiscussionsByBlog({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByBlog({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 15000);
            break;
          case 'feed':
            steem.api.getDiscussionsByFeed({tag: this.id, limit: this.limit}, (err, posts) => {
              this.posts = posts;
            });
            setInterval(() => {
              steem.api.getDiscussionsByFeed({tag: this.id, limit: this.limit}, (err, posts) => {
                this.posts = posts;
              });
            }, 15000);
            break;
        }
      },
      mounted: function() {
        $(this.$el).find('.posts').perfectScrollbar({suppressScrollX: true});
      },
      components: {
        'app-post': {
          template: '#app-post-template',
          props: ['post', 'meta'],
          methods: {
            getDate: function() {
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
            },
            calculateReputation: function(reputation, precision) {
              return calculateSteemitUserReputation(reputation, precision);
            }
          }
        }
      }
    },
  }
});

function calculateSteemitUserReputation(reputation, precision) {
  return (reputation < 0 ? '-' : '') + ((((Math.log10(Math.abs(reputation))) - 9) * 9) + 25).toFixed(precision);
}

function saveToLocalStorage(key, value) {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function loadFromLocalStorage(key) {
  if (typeof(Storage) !== "undefined") {
    return JSON.parse(localStorage.getItem(key));
  }
}