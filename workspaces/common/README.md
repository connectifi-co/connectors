# common code 

## adding a connector

You'll find all the delivery hooks and actions under the src folder.

### adding an action

Use the interfaces in the connectifi SDK and model your action after the examples in `src/actions`.  Once you have your action complete, add it to the action registry in `src/actions/index.ts`


### adding a delivery hook

Use the interfaces in the connectifi SDK and model your delivery hook after the examples in `src/deliveryhooks`.  Once you have your implementations, add it to the delivery hook registry in `src/deliveryhooks/index.ts`