<html>
    <head>
        <style>
            .navbar {
                font-size: 25;
                overflow: hidden;
                background-color: #333;
                position: sticky;
                position: -webkit-sticky;
                top: 0;
            }
            .navbar a {
                float: left;
                display: block;
                color: white;
                text-align: center;
                padding: 14px 20px;
                text-decoration: none;
            }
            .navbar a:hover {
                background-color: #ddd;
                color: black;
            }
            .navbar a.active {
                background-color: #666;
                color: white;
            }
            @media screen and (max-width: 400px) {
                .navbar a {
                    float: none;
                    width: 100%;
                }
                tr,td,th{
                    float: none;
                    width: 100%;
                }
            }
            table {
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                border: 1px solid #ddd;
            }

            th, td {
                text-align: left;
                padding: 16px;
            }

            tr:nth-child(even) {
                background-color: #f2f2f2
            }
        </style>
    </head>
    <body>
        <div class="navbar">
            <a href="/hod/home">Home</a>
            <a href="/contact">Contact</a>
            <a href="#" class="active">My leave</a>
            <a href="/logout" class="right" style="float: right">Logout</a>
        </div>
        <table>
            <tr>
                <th>user_name</th>
                <th>request_day</th>
                <th>leave_from</th>
                <th>leave_to</th>
                <th>total_days</th>
                <th>purpose_of_leaves></th>
                <th>Status</th>
            </tr>
            <% for (i=0; i < leave.length; i++) { %>
                <tr>
                    <td><%= leave[i].user_name %></td>
                    <td><%= leave[i].request_day.getDate() %>/<%= leave[i].request_day.getMonth() %>/<%= leave[i].request_day.getFullYear() %></td>
                    <td><%= leave[i].leave_from.getDate() %>/<%= leave[i].leave_from.getMonth() %>/<%= bookings[i].date.getFullYear() %></td>
                    <td><%= leave[i].leave_to.getDate() %>/<%= leave[i].leave_to.getMonth() %>/<%= leave[i].leave_to.getFullYear() %></td>
                    <td><%= leave[i].total_days %></td>
                    <td><%= leave[i].purpose %></td>
                    <td><%= leave[i].status %></td>
                </tr>
            <% } %>
        </table> 
    </body>
</html>
