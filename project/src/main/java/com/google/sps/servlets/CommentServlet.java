// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.io.IOException;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns some example content.*/
@WebServlet("/comment")
public class CommentServlet extends HttpServlet {
  public ArrayList<String> data = new ArrayList<String>();
  public DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  public UserService userService = UserServiceFactory.getUserService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);
    HashMap<String, String> comments = new HashMap<String, String>();

    int iter = 0;
    for (Entity entity : results.asIterable()) {
        String loadComment = (String) entity.getProperty("comment");
        String loadEmail = (String) entity.getProperty("email");
        long timestamp = (long) entity.getProperty("timestamp");
        comments.put(loadComment, loadEmail);
        iter++;
    }
    
    String json = convertToJsonUsingGson(comments);
    response.setContentType("/thank-you-page.html");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      String comment = request.getParameter("text-input");
      String userEmail = userService.getCurrentUser().getEmail();
      
      long timestamp = System.currentTimeMillis();

      Entity taskEntity = new Entity("Comment");
      taskEntity.setProperty("comment", comment);
      taskEntity.setProperty("email", userEmail);
      taskEntity.setProperty("timestamp", timestamp);

      datastore.put(taskEntity);

      // Redirect back to the HTML page.
      response.sendRedirect("/thank-you-page.html");
  }

  /**
   * Converts an ArrayList into a JSON string using the Gson library.
   */
  private String convertToJsonUsingGson(HashMap<String, String> data){
    Gson gson = new Gson();
    String json = gson.toJson(data);
    return json;
  }
}