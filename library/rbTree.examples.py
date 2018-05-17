from rbTree import *

print('Test 1')

rbTree = RedBlackTree()
rbTree.add(2)
rbTree.add(1)
rbTree.add(4)
rbTree.add(5)
rbTree.add(9)
rbTree.remove(4)
rbTree.remove(2)
rbTree.add(3)
rbTree.add(6)
rbTree.add(7)
rbTree.add(15)

gen = iter(rbTree) # Yields rbTree node
while True:
  try:
    # You can also use node.data if you bound data to the node.
    print(next(gen).value)
  except StopIteration:
    break
# Or just print(rbTree)

print('Floor of 12:', rbTree.floor(12))
print('Ceiling of 12:', rbTree.ceil(12))
print('Contains 9:', rbTree.contains(9))
print('Contains 12:', rbTree.contains(12))

print('Test done.')
print()

print('Test 2')

rbTree = RedBlackTree()
rbTree.add(18, 'dog')
rbTree.add(1, 'kitten')
rbTree.add(8, 'hamster')
rbTree.add(5, 'cat')
rbTree.add(11, 'capybara')
rbTree.add(10)

gen = iter(rbTree)
print(rbTree)

print('Test done.')
print()
