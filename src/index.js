const { Hono } = require("hono");
const { Octokit } = require("octokit");
const app = new Hono();

app.get("/", async (context) => {
  return context.html('😺 Invite to GitHub Organization <hr />User ID:<br /><br /><form action="/" method="post"><input type="text" name="userid"/><input type="submit" /></form>');
});

app.post("/", async (context) => {
  // const userid = context.req.query('userid');
  const body = await context.req.parseBody();
  // var userid = String(body['userid']);
  var userid = body.userid; // Already safely handles undefined
  if (userid == "") {
	  return context.html('😺 Invite to GitHub Organization<hr />💭 Need a username<br /><br /><form action="/" method="post"><input type="text" name="userid"/><input type="submit" /></form>');
  } 
  
  const octokit_client = new Octokit({
    auth: context.env.GITHUB_PAT
  })
  
  try {
	  
    const userinfo = await octokit_client.rest.users.getByUsername({username: userid});
	
    const invite_result = await octokit_client.rest.orgs.createInvitation(
      { org: 'democustomers_EXAMPLE2' ,
        invitee_id: userinfo.data.id
      }
      );
	  
    // Collaborators are limited to 50 a day, org invites might have more quota
	
	return context.html('✅ Invitation sent to ' + userinfo.data.login + ' (' + userinfo.data.id + ') <hr />😺 Invite another user?<br /><br /><form action="/" method="post"><input type="text" name="userid"/><input type="submit" /></form>');
	
  } catch (err) {
	
	return context.html('⚠️ GitHub API returned an error. The user ' + userid + ' might not exist. <br />' + err + '  <hr />😺 Try again?<br />Username: <br /><br /><form action="/" method="post"><input type="text" name="userid"/><input type="submit" /></form>');
	
  }

});

export default app;