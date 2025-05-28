export function extractTweetInfo(tweets) {
    return tweets.map(tweet => {
      const content = tweet.content?.itemContent?.tweet_results?.result;
      const legacy = content?.legacy;
      const user = content?.core?.user_results?.result;
      
      return {
        id: content?.rest_id,
        text: legacy?.full_text,
        createdAt: legacy?.created_at,
        retweetCount: legacy?.retweet_count,
        favoriteCount: legacy?.favorite_count,
        replyCount: legacy?.reply_count,
        quoteCount: legacy?.quote_count,
        lang: legacy?.lang,
        source: legacy?.source,
        user: {
          id: user?.rest_id,
          name: user?.core?.name,
          screenName: user?.core?.screen_name,
          verified: user?.is_blue_verified,
          followersCount: user?.legacy?.followers_count,
          followingCount: user?.legacy?.friends_count
        },
        entities: legacy?.entities,
        quotedStatus: legacy?.quoted_status_id_str,
        retweetedStatus: legacy?.retweeted_status_result?.result?.rest_id,
        full_text: legacy?.retweeted_status_result?.result?.note_tweet?.note_tweet_results?.result?.text,
      };
    });
  }