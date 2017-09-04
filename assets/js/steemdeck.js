let steemDeck = new Vue({
    el: '#app',
    data: {
        account: null,
        rows: {
            0: {
                type: 'trending',
                tag: 'steemdev'
            }
        },
        addNewTag: null,
        addHotTag: null,
        addTrendingTag: null,
        addBlogUser: null,
        addFeedUser: null
    },
    methods: {
        resetNewFollowers: function () {
            this.newFollowers = 0;
        },
        resetNewReplies: function () {
            this.newReplies = 0;
        },
        resetNewUpvotes: function () {
            this.newUpvotes = 0;
        }
    },
    components: {
        'sd-top-bar': {
            template: '#top-bar-template',
            data: function () {
                return {
                    usernameQuery: null,
                    lookingUpAccount: false,
                    account: null,
                    accountTmp: null,
                    userInfo: {
                        account: null,
                        username: null,
                        profileImage: null,
                        meta: null,
                        reputation: null,
                        followers: null,
                        newFollowers: null,
                        following: null,
                        posts: null,
                        replies: null,
                        newReplies: null,
                        upvotes: null,
                        newUpvotes: null,
                        votingPower: null
                    },
                    updateUserInterval: null,
                    updateUserIntervalSeconds: 30
                }
            },
            methods: {
                lookupAccount: function () {
                    this.accountTmp = null;
                    this.lookingUpAccount = true;
                    steem.api.getAccounts([this.usernameQuery], (err, accounts) => {
                        if (!err) {
                            this.accountTmp = accounts[0];
                        }

                        this.lookingUpAccount = false;
                    });
                },
                setUserInfo: function (e) {
                    e.preventDefault();
                    if (this.accountTmp) {
                        this.account = this.accountTmp;
                        this.updateUser();

                        clearInterval(this.updateUserInterval);
                        this.updateUserInterval = setInterval(() => {
                            this.updateUser();
                        }, this.updateUserIntervalSeconds * 1000);
                    }
                },
                updateUser: function () {
                    if (this.account) {
                        steem.api.getAccounts([this.account.name], (err, accounts) => {
                            if (!err) {
                                steem.api.getFollowCount(this.account.name, (err, followers) => {
                                    if (!err) {
                                        this.account = accounts[0];
                                        this.userInfo.account = this.account;
                                        this.userInfo.username = this.account.name;
                                        this.userInfo.reputation = calculateReputation(this.account.reputation, 0);
                                        this.userInfo.posts = this.account.post_count;
                                        this.userInfo.votingPower = calculateVotingPower(this.account.voting_power, this.account.last_vote_time);

                                        this.userInfo.profileImage = null;
                                        if (this.account.json_metadata) {
                                            let meta = JSON.parse(this.account.json_metadata);
                                            if (meta.profile) {
                                                this.userInfo.profileImage = meta.profile;
                                            }
                                        }

                                        this.userInfo.followers = followers.follower_count;
                                        this.userInfo.following = followers.following_count;
                                    }
                                });
                            }
                        });
                    }
                },
                resetAccount: function () {
                    this.account = null;
                    this.userInfo = {
                        account: null,
                        username: null,
                        profileImage: null,
                        meta: null,
                        reputation: null,
                        followers: null,
                        newFollowers: null,
                        following: null,
                        posts: null,
                        replies: null,
                        newReplies: null,
                        upvotes: null,
                        newUpvotes: null,
                        votingPower: null
                    };
                    clearInterval(this.updateUserInterval);
                }
            },
        },
        'sd-bottom-bar': {
            template: '#bottom-bar-template'
        },
        'sd-row': {
            template: '#row-template',
            props: ['row']
        }
    }
});

function calculateReputation(reputation, precision) {
    let score = (reputation < 0 ? '-' : '') + ((((Math.log10(Math.abs(reputation))) - 9) * 9) + 25);

    return precision ? score.toFixed(2) : Math.floor(score);
}

function calculateVotingPower(votingPower, lastVoteTime) {
    let secondsPassedSinceLastVote = (new Date - new Date(lastVoteTime + "Z")) / 1000;
    votingPower += (10000 * secondsPassedSinceLastVote / 432000);

    return Math.min(votingPower / 100, 100).toFixed(2);
}

// var steemDeck = new Vue({
//     el: '#app',
//     data: {
//         followers: 277,
//         newFollowers: 0,
//         following: 71,
//         newReplies: 0,
//         newUpvotes: 0,
//         votingPower: 86.12,
//
//         addNewTag: null,
//         addHotTag: null,
//         addTrendingTag: null,
//         addBlogUser: null,
//         addFeedUser: null
//     },
//     methods: {
//         resetNewFollowers: function () {
//             this.newFollowers = 0;
//         },
//         resetNewReplies: function () {
//             this.newReplies = 0;
//         },
//         resetNewUpvotes: function () {
//             this.newUpvotes = 0;
//         }
//     }
// });

$('#followers').on('show.uk.modal', function () {
    steemDeck.resetNewFollowers();
});

$('#replies').on('show.uk.modal', function () {
    steemDeck.resetNewReplies();
});

$('#upvotes').on('show.uk.modal', function () {
    steemDeck.resetNewUpvotes();
});

setInterval(function () {
    ++steemDeck.followers;
    if (!$('#followers.uk-open').length) {
        ++steemDeck.newFollowers;
    }
}, 10000);

setInterval(function () {
    if (!$('#replies.uk-open').length) {
        ++steemDeck.newReplies;
    }
}, 15000);

setInterval(function () {
    if (!$('#upvotes.uk-open').length) {
        ++steemDeck.newUpvotes;
    }
}, 8000);

setInterval(function () {
    steemDeck.votingPower = parseFloat(steemDeck.votingPower + 0.01).toFixed(2);
}, 20000);

$('.row-refresh').on('click', function () {
    var newPost = $('.row').first().find('.post').first().clone();
    $('.row').first().find('.uk-slider').prepend(newPost);
    var slider = UIkit.slider($('.row').first(), { infinite: false, threshold: 50 });
});

$('.row').on('focusitem.uk.slider', function (event, index) {
    var numberOfPosts = $(this).find('.post').length,
        visiblePosts = window.innerWidth > 767 ? (window.innerWidth > 959 ? 4 : 2) : 1;

    $(this).find('.scroll-indicator').css('width', (visiblePosts / numberOfPosts * 100).toFixed(2) + '%');
    $(this).find('.scroll-indicator').css('left', ((visiblePosts / numberOfPosts * 100) * (index / visiblePosts )).toFixed(2) + '%');
});

var cursorPosition = {};
$('.open-post').on('mousedown', function (e) {
    cursorPosition.x = e.clientX;
    cursorPosition.y = e.clientY;
});
$('.open-post').on('mouseup', function (e) {
    if (Math.abs(cursorPosition.x - e.clientX) < 25 && Math.abs(cursorPosition.y - e.clientY) < 25) {
        var modal = UIkit.modal('#post');

        if (modal.isActive()) {
            modal.hide();
        } else {
            modal.show();
        }
    }
});