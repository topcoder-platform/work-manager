#!/bin/bash
./node_modules/.bin/webdriver-manager start --detach
npm run test

test_exit_code=$?

if [ $test_exit_code -eq 0 ]; then
  echo "Tests successfully completed"
else
  echo "Tests failed"
fi

exit $test_exit_code