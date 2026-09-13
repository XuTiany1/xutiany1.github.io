

# Differential Drive

I.E. a wheel chair, tank

Total distance drive = (d_left + d_right) / 2


Consider a tank, 


# Classical Planning

Classical planning is a set of logical statements (i.e. book is on the table)

Classical planning gives:




3 big classes:

1. Roadmap: geometric planning algorithms
You take the euclidean space or rotational space (which is euclidean space with rotation).

There are three methods:
- Visibility graph: optimal w.r.t. the distance we have to travel
Can produce shortest paths in 2-d configuration spaces 

Depends on the world that is made up of polygons, because this graph depends on connecting the edges

Vertex visibility graph: Idea is: take every vertex of every object and connect it to every other vertex of every other object in the scene. 

Except that you need to go from start "S" to goal "G"

So we can have M polygons and N vertices, and have a upper bound of N^2 edges (note, this upperbound do not take into account the 'no crossing over other edges' rule)


- Voronoi diagram: 
Never touches any object. 

Optimize risk. So that we stay as far away from obstacles as we can. 

- Probabilistic roadmaps:



2. Cell decomposition
Decompose free space into simple cells like a chessboard





3. Potential field
You build a function in the free space, and you start from a point on that field and try to get to 0

















































